import { TChildren, zone } from "osh";
import { docComment, line, indent, declSymbol } from "osh-code";
import { DYNAMIC_SIZE, FieldFlags } from "pck";
import { GoType, GoField, GoSchema, GoBinder } from "../schema";
import { declArgs, declVars, v, SELF, callMethod, len, calcVarUintSize } from "./utils";
import { sizeIvar, sizeUvar } from "./lib";

const SIZE = v("size");
const LENGTH = v("length");

export function sizeMethod(binder: GoBinder, schema: GoSchema): TChildren {
  const details = binder.getSchemaDetails(schema);

  return (
    zone(`sizeMethod(${schema.struct})`,
      declArgs(
        [
          declSymbol("self", schema.self),
        ],
        [
          docComment(
            line("PckSize is an automatically generated method for PCK serialized size calculation."),
          ),
          details.size.dynamic ?
            declVars(["size", "length"],
              [
                line("func (", SELF(), " *", schema.struct, ") PckSize() (", SIZE, " int) {"),
                indent(
                  line("var ", LENGTH, " int"),
                  line("_ = ", LENGTH),
                  line(SIZE, " = ", details.size.fixedSize),
                  details.dynamicFields.map((f) => incFieldSize(binder, f)),
                  line("return"),
                ),
                line("}"),
              ],
            ) :
            [
              line("func (", SELF(), " *", schema.struct, ") PckSize() int {"),
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

export function sizeWithTagMethod(binder: GoBinder, schema: GoSchema): TChildren {
  const details = binder.getSchemaDetails(schema);

  return (
    zone(`sizeWithTagMethod(${schema.struct})`,
      declArgs(
        [
          declSymbol("self", schema.self),
        ],
        [
          docComment(
            line("PckSizeWithTag is an automatically generated method for PCK serialized size calculation."),
          ),
          line("func (", SELF(), " *", schema.struct, ") PckSizeWithTag() int {"),
          indent(
            details.tag === -1
              ? line(`panic("${schema.struct} doesn't support tagged serialization")`)
              : line("return ", calcVarUintSize(details.tag), " + ", callMethod(SELF(), "PckSize", [])),
          ),
          line("}"),
        ],
      ),
    )
  );
}

function incFieldSize(binder: GoBinder, field: GoField): TChildren {
  if (field.isOptional()) {
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

function incSizeValue(binder: GoBinder, type: GoType, value?: TChildren): TChildren {
  switch (type.id) {
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
    case "string":
    case "bytes":
      return [
        line(LENGTH, " = ", len(value)),
        incSize(sizeUvar(LENGTH), " + ", LENGTH),
      ];
    case "array":
      const valueSize = binder.getTypeSize(type.valueType);
      if (type.length === 0) {
        if (valueSize === DYNAMIC_SIZE) {
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
        if (valueSize === DYNAMIC_SIZE) {
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
    case "schema":
      return incSize(callMethod(value, "PckSize"));
    case "union":
      return incSize(callMethod(value, "PckTagSize"), " + ", callMethod(value, "PckSize"));
  }
}

function incSize(...children: TChildren[]): TChildren {
  return line(SIZE, " += ", children);
}
