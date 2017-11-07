import { TChildren } from "osh";
import { docComment, line, indent, declSymbol } from "osh-code";
import { DYNAMIC_SIZE, FieldFlags, Type } from "pck";
import { GoField, GoSchema, GoBinder } from "../schema";
import { declArgs, declVars, v, SELF, callMethod, len } from "./utils";
import { sizeIvar, sizeUvar } from "./lib";

const SIZE = v("size");
const LENGTH = v("length");

export function sizeMethod(binder: GoBinder, schema: GoSchema): TChildren {
  const details = binder.getSchemaDetails(schema);

  return (
    declArgs([declSymbol("self", schema.self)],
      [
        docComment(
          line("Size is an automatically generated method for PCK serialized size calculation."),
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
    )
  );
}

function incFieldSize(binder: GoBinder, field: GoField): TChildren {
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

function incSizeValue(binder: GoBinder, type: Type, value?: TChildren): TChildren {
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
    case "schema":
      return incSize(callMethod(value, "PckSize"));
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
  }
}

function incSize(...children: TChildren[]): TChildren {
  return line(v("size"), " += ", children);
}
