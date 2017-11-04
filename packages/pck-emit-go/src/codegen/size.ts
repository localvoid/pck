import { Context, TChildren, TNode, component } from "osh";
import { docComment, line, indent, declSymbol } from "osh-code";
import { FieldFlags, Type, Binder } from "pck";
import { GoField, GoSchema } from "../schema";
import { getBundle, enterSchema, declArgs, declVars, v, SELF, callMethod, len } from "./utils";
import { sizeIvar, sizeUvar } from "./lib";

const SIZE = v("size");
const LENGTH = v("length");

export function SizeMethod(ctx: Context, schema: GoSchema): TChildren {
  const bundle = getBundle(ctx);
  const details = bundle.binder.getSchemaDetails(schema);

  return (
    enterSchema(schema,
      declArgs([declSymbol("self", schema.self)],
        [
          docComment(
            line("Size is an automatically generated method for PCK serialized size calculation."),
          ),
          details.size.dynamic ?
            declVars(["size", "length"],
              [
                line("func (", SELF(), " *", schema.struct, ") Size() (", SIZE, " int) {"),
                indent(
                  line("var ", LENGTH, " int"),
                  line("_ = ", LENGTH),
                  line(SIZE, " = ", details.size.fixedSize),
                  details.dynamicFields.map((f) => incFieldSize(bundle.binder, f)),
                  line("return"),
                ),
                line("}"),
              ],
            ) :
            [
              line("func (", SELF(), " *", schema.struct, ") Size() int {"),
              indent(
                line("return ", details.size.fixedSize),
              ),
              line("}"),
            ],
        ],
      ),
    )
  );
}

export function sizeMethod(schema: GoSchema): TNode {
  return component(SizeMethod, schema);
}

function incFieldSize(binder: Binder<GoSchema, GoField>, field: GoField): TChildren {
  if (field.isOptional()) {
    switch (field.type.id) {
      case "array":
        return incSizeValue(binder, field.type, SELF(field.name));
    }

    if ((field.flags & (FieldFlags.OmitNull | FieldFlags.OmitEmpty)) === (FieldFlags.OmitNull | FieldFlags.OmitEmpty)) {
      return [
        line("if ", SELF(field.name), " != nil && ", len(SELF(field.name)), " > 0 {"),
        indent(incSizeValue(binder, field.type, SELF(field.name))),
        line("}"),
      ];
    }
    if ((field.flags & FieldFlags.OmitNull) !== 0) {
      return [
        line("if ", SELF(field.name), " != nil {"),
        indent(incSizeValue(binder, field.type, SELF(field.name))),
        line("}"),
      ];
    }
    if ((field.flags & FieldFlags.OmitZero) !== 0) {
      return [
        line("if ", SELF(field.name), " != 0 {"),
        indent(incSizeValue(binder, field.type, SELF(field.name))),
        line("}"),
      ];
    }
    if ((field.flags & FieldFlags.OmitEmpty) !== 0) {
      return [
        // TODO: should reuse len value
        line("if ", len(SELF(field.name)), " > 0 {"),
        indent(incSizeValue(binder, field.type, SELF(field.name))),
        line("}"),
      ];
    }
  }

  return incSizeValue(binder, field.type, SELF(field.name));
}

function incSizeValue(binder: Binder<GoSchema, GoField>, type: Type, value?: TChildren): TChildren {
  switch (type.id) {
    case "union":
    case "map":
    case "bool":
      return null;
    case "int":
    case "float":
      return incSize(type.size);
    case "varint":
      if (type.signed) {
        return incSize(sizeIvar(value));
      } else {
        return incSize(sizeUvar(value));
      }
    case "utf8":
    case "ascii":
    case "bytes":
      return [
        line(LENGTH, " = ", len(value)),
        incSize(sizeUvar(LENGTH), " + ", LENGTH),
      ];
    case "ref":
      return incSize(callMethod(value, "Size"));
    case "array":
      const valueSize = binder.getTypeSize(type.valueType);
      if (type.length === 0) {
        if (valueSize === -1) {
          return declVars(
            ["item"],
            [
              incSize(sizeUvar(len(value))),
              line("for _, ", v("item"), " := range ", value, " {"),
              indent(
                incSizeValue(binder, type.valueType, v("item")),
              ),
              line("}"),
            ],
          );
        } else {
          return [
            line(v("length"), " = ", len(value)),
            incSize(sizeUvar(v("length")), " + ", v("length"), "*", valueSize),
          ];
        }
      } else {
        if (valueSize === -1) {
          return declVars(
            ["item"],
            [
              line("for _, ", v("item"), " := range ", value, " {"),
              indent(
                incSizeValue(binder, type.valueType, v("item")),
              ),
              line("}"),
            ],
          );
        } else {
          throw new Error("Unreachable code");
        }
      }
  }
}

function incSize(...children: TChildren[]): TChildren {
  return line(v("size"), " += ", children);
}
