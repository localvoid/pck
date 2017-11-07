import { TChildren, TNode, zone } from "osh";
import { capitalizeTransformer } from "osh-text";
import { line, indent, docComment, scope, declSymbol, sym } from "osh-code";
import { FieldFlags, Field, SchemaDetails } from "pck";
import {
  declArgs, declVars, SELF, BUF, v, len, slice, castToByte, boundCheckHint, callFunc, callMethod,
} from "./utils";
import { writeUvar, writeIvar } from "./lib";
import { GoSchema, GoField, GoBinder } from "../schema";

const OPTIONALS = Symbol("Optionals");
const OFFSET = v("offset");
const BIT_SET_VALUE = v("bitSetValue");

export function pckMethod(binder: GoBinder, schema: GoSchema): TNode {
  const details = binder.getSchemaDetails(schema);

  return (
    zone(`pckMethod(${schema.struct})`,
      declArgs(
        [
          declSymbol("self", schema.self),
          declSymbol("buf", "b"),
        ],
        declVars(["offset", "bitSetValue"],
          declOptionals(details.optionalFields,
            [
              docComment(
                line("Pck is an automatically generated method for PCK serialization."),
              ),
              line("func (", SELF(), " *", schema.struct, ") Pck(", BUF(), " []byte) int {"),
              indent(
                (details.size.fixedSize > 1) ? boundCheckHint(details.size.fixedSize - 1) : null,
                (details.optionalFields.length > 0)
                  ? details.optionalFields.map((f) => line(OPTIONAL(f), " := ", checkOptional(f)))
                  : null,
                writeBitSet(schema, details),
                writeFields(binder, schema, details),
                line("return ", details.size.dynamic ? OFFSET : details.size.fixedSize),
              ),
              line("}"),
            ],
          ),
        ),
      ),
    )
  );
}

function writeBitSet(schema: GoSchema, details: SchemaDetails<GoSchema, GoField>): TChildren {
  if (details.bitStore.length > 0) {
    if (details.bitStore.length === 1) {
      if (details.bitStore.optionals.length > 0) {
        return [
          line("if ", OPTIONAL(details.bitStore.optionals[0].field), " {"),
          indent(line(BUF({ offset: 0 }, 1))),
          line("}"),
        ];
      } else {
        return [
          line("if ", SELF(details.bitStore.booleans[0].field.name), " {"),
          indent(line(BUF({ offset: 0 }, 1))),
          line("}"),
        ];
      }
    } else {
      const result = [];
      let bitSetIndex = 0;
      let offset = 0;
      let i = 0;
      for (const bitField of details.bitStore.optionals) {
        result.push(
          line("if ", OPTIONAL(bitField.field), " {"),
          indent(
            (bitSetIndex === 0)
              ? line(BIT_SET_VALUE, " = 1")
              : line(BIT_SET_VALUE, " |= 1 << ", bitSetIndex),
          ),
          line("}"),
        );
        bitSetIndex++;
        if (bitSetIndex === 8) {
          bitSetIndex = 0;
          result.push(
            line(BUF({ offset }, BIT_SET_VALUE)),
            (i < (details.bitStore.length - 1))
              ? line(BIT_SET_VALUE, " = 0")
              : null,
          );
          offset++;
        }
        i++;
      }
      for (const bitField of details.bitStore.booleans) {
        result.push(
          line("if ", SELF(bitField.field.name), " {"),
          indent(
            bitSetIndex === 0 ?
              line(BIT_SET_VALUE, " = 1") :
              line(BIT_SET_VALUE, " |= 1 << ", bitSetIndex),
          ),
          line("}"),
        );
        bitSetIndex++;
        if (bitSetIndex === 8) {
          bitSetIndex = 0;
          result.push(
            line(BUF({ offset }, BIT_SET_VALUE)),
            (i < (details.bitStore.length - 1))
              ? line(BIT_SET_VALUE, " = 0")
              : null,
          );
          offset++;
        }
        i++;
      }
      if (bitSetIndex > 0) {
        result.push(line(BUF({ offset }, BIT_SET_VALUE)));
        offset++;
      }
      result.push(line(OFFSET, " += ", offset));

      return result;
    }
  }

  return null;
}

function writeFields(binder: GoBinder, schema: GoSchema, details: SchemaDetails<GoSchema, GoField>): TChildren {
  const r = [];
  let offset = details.size.bitStoreSize;
  for (const field of details.fixedFields) {
    r.push(putFixedField(binder, field, offset));
    offset += binder.getTypeSize(field.type);
  }
  if (details.size.dynamic) {
    r.push(line(OFFSET, " := ", offset));
  }
  for (const field of details.dynamicFields) {
    if (field.isOptional()) {
      r.push(
        line("if ", OPTIONAL(field), " {"),
        indent(putDynamicField(field)),
        line("}"),
      );
    } else {
      r.push(putDynamicField(field));
    }
  }

  return r;
}

function putFixedField(binder: GoBinder, field: GoField, offset: number): TChildren {
  switch (field.type.id) {
    case "int":
      switch (field.type.size) {
        case 1:
          return inlineWriteUint8(SELF(field.name), offset);
        case 2:
          return inlineWriteUint16(SELF(field.name), offset);
        case 4:
          return inlineWriteUint32(SELF(field.name), offset);
      }
      break;
    case "float":
      switch (field.type.size) {
        case 4:
          return inlineWriteUint32(SELF(field.name), offset);
        case 8:
          return inlineWriteUint64(SELF(field.name), offset);
      }
      break;
    case "bytes":
    case "utf8":
    case "ascii":
      return putCopy(SELF(field.name), offset);
    case "array":
      break;
    case "schema":
      return line(callMethod(SELF(field.name), "Pck", [slice(BUF(), offset)]));
  }

  throw new Error(`Invalid field: ${field.toString()}.`);
}

function putDynamicField(field: GoField): TChildren {
  switch (field.type.id) {
    case "varint":
      return field.type.signed
        ? line(OFFSET, " += ", writeIvar(slice(BUF(), OFFSET), SELF(field.name)))
        : line(OFFSET, " += ", writeUvar(slice(BUF(), OFFSET), SELF(field.name)));
    case "bytes":
    case "utf8":
    case "ascii":
      return [
        line(OFFSET, " += ", writeUvar(slice(BUF(), OFFSET), len(SELF(field.name)))),
        line(OFFSET, " += ", callFunc("copy", [slice(BUF(), OFFSET), SELF(field.name)])),
      ];
    case "array":
    case "map":
      return "TODO";
    case "schema":
      return line(OFFSET, " += ", callMethod(SELF(field.name), "Pck", [slice(BUF(), OFFSET)]));
    case "union":
      return "TODO";
  }

  throw new Error(`Unable to emit dynamic writer for a field: ${field.toString()}.`);
}

function declOptionals(fields: Field<any>[], children: TChildren): TChildren {
  return scope({
    type: OPTIONALS,
    symbols: fields.map((f) => declSymbol(f, `optional${capitalizeTransformer(f.name)}`)),
    children: children,
  });
}

function OPTIONAL(field: Field<any>): TNode {
  return sym(OPTIONALS, field);
}

function checkOptional(field: Field<any>): TChildren {
  if ((field.flags & (FieldFlags.OmitEmpty | FieldFlags.OmitNull)) === (FieldFlags.OmitEmpty | FieldFlags.OmitNull)) {
    return [SELF(field.name), " != nil", " && ", len(SELF(field.name)), " > 0"];
  }
  if ((field.flags & FieldFlags.OmitNull) !== 0) {
    return [SELF(field.name), " != nil"];
  }
  if ((field.flags & FieldFlags.OmitEmpty) !== 0) {
    return [len(SELF(field.name)), " > 0"];
  }
  if ((field.flags & FieldFlags.OmitZero) !== 0) {
    return [SELF(field.name), " != 0"];
  }

  throw new Error("Unreachable");
}

function putCopy(value: TChildren, offset?: number): TChildren {
  if (offset === undefined) {
    return line(OFFSET, " += ", callFunc("copy", [slice(BUF(), OFFSET), value]));
  }
  return line(callFunc("copy", [slice(BUF(), offset), value]));
}

function inlineWriteUint8(value: TChildren, offset?: number): TChildren {
  let start;
  if (offset === undefined) {
    start = OFFSET;
    offset = 0;
  }
  return line(BUF({ start, offset: offset }, castToByte(value)));
}

function inlineWriteUint16(value: TChildren, offset?: number): TChildren {
  let start;
  if (offset === undefined) {
    start = OFFSET;
    offset = 0;
  }
  return [
    line(BUF({ start, offset: offset + 0 }, castToByte(value))),
    line(BUF({ start, offset: offset + 1 }, castToByte([value, " >> 8"]))),
  ];
}

function inlineWriteUint32(value: TChildren, offset?: number): TChildren {
  let start;
  if (offset === undefined) {
    start = OFFSET;
    offset = 0;
  }
  return [
    line(BUF({ start, offset: offset + 0 }, castToByte(value))),
    line(BUF({ start, offset: offset + 1 }, castToByte([value, " >> 8"]))),
    line(BUF({ start, offset: offset + 2 }, castToByte([value, " >> 16"]))),
    line(BUF({ start, offset: offset + 3 }, castToByte([value, " >> 24"]))),
  ];
}

function inlineWriteUint64(value: TChildren, offset?: number): TChildren {
  let start;
  if (offset === undefined) {
    start = OFFSET;
    offset = 0;
  }
  return [
    line(BUF({ start, offset: offset + 0 }, castToByte(value))),
    line(BUF({ start, offset: offset + 1 }, castToByte([value, " >> 8"]))),
    line(BUF({ start, offset: offset + 2 }, castToByte([value, " >> 16"]))),
    line(BUF({ start, offset: offset + 3 }, castToByte([value, " >> 24"]))),
    line(BUF({ start, offset: offset + 5 }, castToByte([value, " >> 32"]))),
    line(BUF({ start, offset: offset + 6 }, castToByte([value, " >> 40"]))),
    line(BUF({ start, offset: offset + 7 }, castToByte([value, " >> 48"]))),
    line(BUF({ start, offset: offset + 8 }, castToByte([value, " >> 56"]))),
  ];
}
