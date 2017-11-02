import { TChildren } from "osh";
import { docComment, line, indent, declSymbol } from "osh-code";
import { Field, Type, Schema } from "pck";
import { enterSchema, declArgs, declVars, v, self, structName, callMethod, len } from "./utils";
import { sizeIvar, sizeUvar } from "./lib";

export function sizeMethod(schema: Schema): TChildren {
  return (
    enterSchema(schema,
      declArgs([declSymbol("self", "s")],
        [
          docComment(
            line("Size is an automatically generated method for PCK serialized size calculation."),
          ),
          schema.hasDynamicSize() ?
            declVars(["size", "length"],
              [
                line("func (", self(), " *", structName(schema), ") Size() (", v("size"), " int) {"),
                indent(
                  line("var ", v("length"), " int"),
                  line("_ = ", v("length")),
                  line(v("size"), " = ", schema.getFixedSize()),
                  schema.sortedDynamicFields.map(incFieldSize),
                  line("return"),
                ),
                line("}"),
              ],
            ) :
            [
              line("func (", self(), " *", structName(schema), ") Size() int {"),
              indent(
                line("return ", schema.getFixedSize()),
              ),
              line("}"),
            ],
        ],
      ),
    )
  );
}

function incFieldSize(field: Field<any>): TChildren {
  if (field.isOptional()) {
    if (field.type.isArray()) {
      return incSizeValue(field.type, self(field.name));
    }

    if (field.isOmitNull()) {
      if (field.isOmitEmpty()) {
        return [
          line("if ", self(field.name), " != nil && ", len(self(field.name)), " > 0 {"),
          indent(incSizeValue(field.type, self(field.name))),
          line("}"),
        ];
      }
      return [
        line("if ", self(field.name), " != nil {"),
        indent(incSizeValue(field.type, self(field.name))),
        line("}"),
      ];
    } else if (field.isOmitZero()) {
      return [
        line("if ", self(field.name), " != 0 {"),
        indent(incSizeValue(field.type, self(field.name))),
        line("}"),
      ];
    } else if (field.isOmitEmpty()) {
      return [
        // TODO: should reuse len value
        line("if ", len(self(field.name)), " > 0 {"),
        indent(incSizeValue(field.type, self(field.name))),
        line("}"),
      ];
    }
  }

  return incSizeValue(field.type, self(field.name));
}

function incSizeValue(type: Type<any>, value?: TChildren): TChildren {
  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return incSize(sizeIvar(value));
      } else {
        return incSize(sizeUvar(value));
      }
    }
    return incSize(type.size);
  }

  if (type.isArray()) {
    if (type.props.length === 0) {
      if (type.props.type.hasDynamicSize()) {
        return declVars(
          ["item"],
          [
            incSize(sizeUvar(len(value))),
            line("for _, ", v("item"), " := range ", value, " {"),
            indent(
              incSizeValue(type.props.type, v("item")),
            ),
            line("}"),
          ],
        );
      } else {
        return [
          line(v("length"), " = ", len(value)),
          incSize(sizeUvar(v("length")), " + ", v("length"), "*", type.props.type.size),
        ];
      }
    } else {
      if (type.props.type.hasDynamicSize()) {
        return declVars(
          ["item"],
          [
            line("for _, ", v("item"), " := range ", value, " {"),
            indent(
              incSizeValue(type.props.type, v("item")),
            ),
            line("}"),
          ],
        );
      } else {
        throw new Error("Unreachable code");
      }
    }
  }

  if (type.isString() || type.isByteArray()) {
    return [
      line(v("length"), " = ", len(value)),
      incSize(sizeUvar(v("length")), " + ", v("length")),
    ];
  }

  if (type.isRef()) {
    return incSize(callMethod(value, "Size"));
  }

  return incSize(type.size);
}

function incSize(...children: TChildren[]): TChildren {
  return line(v("size"), " += ", children);
}
