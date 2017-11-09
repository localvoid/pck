import { TChildren, zone } from "osh";
import { docComment, line, indent, declSymbol } from "osh-code";
import { DYNAMIC_SIZE, FieldFlags } from "pck";
import { GoType, GoField, GoSchema, GoBinder } from "../schema";
import { declArgs, declVars, v, SELF, callMethod, len, calcVarUintSize } from "./utils";
import { sizeVarInt, sizeVarUint } from "./lib";

const SIZE = v("size");
const LENGTH = v("length");

function ITEM(depth: number): TChildren {
  return v(`item${depth}`);
}

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
          declVars(["size", "length", declSymbol("item1", "item")],
            [
              line("func (", SELF(), " *", schema.struct, ") PckSize() int {"),
              indent(
                details.size.dynamic
                  ? [
                    line(SIZE, " := ", details.size.fixedSize),
                    details.dynamicFields.map((f) => incFieldSize(binder, f)),
                    line("return ", SIZE),
                  ]
                  : line("return ", details.size.fixedSize),
              ),
              line("}"),
            ],
          ),
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
        declVars([declSymbol("item1", "item")],
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
      ),
    )
  );
}

function incFieldSize(binder: GoBinder, field: GoField): TChildren {
  if (field.isOptional()) {
    if ((field.flags & (FieldFlags.OmitNull | FieldFlags.OmitEmpty)) === (FieldFlags.OmitNull | FieldFlags.OmitEmpty)) {
      if (field.type.id === "array" || field.type.id === "map") {
        return [
          line("if ", len(SELF(field.name)), " != 0 {"),
          indent(incSizeValue(binder, field.type, SELF(field.name))),
          line("}"),
        ];
      }
      return [
        line("if ", SELF(field.name), " != nil {"),
        indent(
          line("if ", LENGTH, " := ", len(SELF(field.name)), "; ", LENGTH, " != 0 {"),
          indent(incSizeValue(binder, field.type, SELF(field.name), 1, true)),
          line("}"),
        ),
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
        line("if ", LENGTH, " := ", len(SELF(field.name)), "; ", LENGTH, " != 0 {"),
        indent(incSizeValue(binder, field.type, SELF(field.name), 1, true)),
        line("}"),
      ];
    }
  }

  return incSizeValue(binder, field.type, SELF(field.name));
}

function incSizeValue(binder: GoBinder, type: GoType, value: TChildren, depth = 1, cachedLength?: boolean): TChildren {
  switch (type.id) {
    case "map":
    case "bool":
    case "int":
    case "float":
      return null;
    case "varint":
      return line(SIZE, " += ", type.signed ? sizeVarInt(value) : sizeVarUint(value));
    case "string":
    case "bytes":
      if (cachedLength === true) {
        return line(SIZE, " += ", sizeVarUint(LENGTH), " + ", LENGTH);
      } else {
        return [
          line("{"),
          indent(
            line(LENGTH, " := ", len(value)),
            line(SIZE, " += ", sizeVarUint(LENGTH), " + ", LENGTH),
          ),
          line("}"),
        ];
      }
    case "array":
      const valueSize = binder.getTypeSize(type.valueType);
      if (valueSize === DYNAMIC_SIZE) {
        return [
          (type.length === 0)
            ? line(SIZE, " += ", sizeVarUint(len(value)))
            : null,
          line("for _, ", ITEM(depth), " := range ", value, " {"),
          indent(
            declVars([`item${depth + 1}`],
              incSizeValue(binder, type.valueType, ITEM(depth)),
            ),
          ),
          line("}"),
        ];
      } else if (type.length === 0) {
        if (cachedLength === true) {
          return line(SIZE, " += ", sizeVarUint(LENGTH), " + ", LENGTH, "*", valueSize);
        } else {
          return [
            line("{"),
            indent(
              line(LENGTH, " := ", len(value)),
              line(SIZE, " += ", sizeVarUint(LENGTH), " + ", LENGTH, "*", valueSize),
            ),
            line("}"),
          ];
        }
      } else {
        throw new Error("Unreachable code");
      }
    case "schema":
      return line(SIZE, " += ", callMethod(value, "PckSize"));
    case "union":
      return line(SIZE, " += ", callMethod(value, "PckSizeWithTag"));
  }
}
