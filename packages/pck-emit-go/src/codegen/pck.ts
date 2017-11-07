import { TChildren, TNode, zone } from "osh";
import { capitalizeTransformer } from "osh-text";
import { line, indent, docComment, scope, declSymbol, sym } from "osh-code";
import { Type, FieldFlags, Field, SchemaDetails } from "pck";
import {
  declArgs, declVars, Value, SELF, BUF, v, len, boundCheckHint, callFunc, callMethod, calcVarUintSize,
} from "./utils";
import {
  InlineWriteIntOptions, inlineWriteUint8, inlineWriteUint16, inlineWriteUint32, inlineWriteUint64,
  writeUvar, writeIvar,
} from "./lib";
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
              line("func (", SELF(), " *", schema.struct, ") Pck(", BUF.value, " []byte) int {"),
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

export function pckTagMethod(binder: GoBinder, schema: GoSchema): TNode {
  const details = binder.getSchemaDetails(schema);
  const size = details.tag > 0 ? calcVarUintSize(details.tag) : 1;

  return (
    zone(`pckTagMethod(${schema.struct})`,
      declArgs(
        [
          declSymbol("self", schema.self),
          declSymbol("buf", "b"),
        ],
        [
          docComment(
            line("PckTag is an automatically generated method for PCK serialization."),
          ),
          line("func (", SELF(), " *", schema.struct, ") PckTag(", BUF.value, " []byte) int {"),
          indent(
            (size > 1) ? boundCheckHint(size) : null,
            (details.tag === -1)
              ? line("return 0")
              : line("return ", writeUvar(BUF.value, details.tag)),
          ),
          line("}"),
        ],
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
          indent(line(BUF.assignAt(0, 1))),
          line("}"),
        ];
      } else {
        return [
          line("if ", SELF(details.bitStore.booleans[0].field.name), " {"),
          indent(line(BUF.assignAt(0, 1))),
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
            line(BUF.assignAt(offset, BIT_SET_VALUE)),
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
            line(BUF.assignAt(offset, BIT_SET_VALUE)),
            (i < (details.bitStore.length - 1))
              ? line(BIT_SET_VALUE, " = 0")
              : null,
          );
          offset++;
        }
        i++;
      }
      if (bitSetIndex > 0) {
        result.push(line(BUF.assignAt(offset, BIT_SET_VALUE)));
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
    r.push(writeFixedType(binder, field.type, new Value(SELF(field.name)), BUF, offset));
    offset += binder.getTypeSize(field.type);
  }

  if (details.size.dynamic) {
    r.push(line(OFFSET, " := ", offset));
  }
  for (const field of details.dynamicFields) {
    if (field.isOptional()) {
      r.push(
        line("if ", OPTIONAL(field), " {"),
        indent(writeDynamicType(binder, field.type, new Value(SELF(field.name)), BUF)),
        line("}"),
      );
    } else {
      r.push(writeDynamicType(binder, field.type, new Value(SELF(field.name)), BUF));
    }
  }

  return r;
}

function writeFixedType(
  binder: GoBinder,
  type: Type,
  from: Value,
  to: Value,
  offset: number,
  start?: TChildren,
) {
  const size = binder.getTypeSize(type);
  switch (type.id) {
    case "int":
    case "float": {
      const opts: InlineWriteIntOptions = {
        from: from,
        to: to,
        offset: offset,
        start: start,
      };
      if (type.id === "int") {
        switch (size) {
          case 1:
            return inlineWriteUint8(opts);
          case 2:
            return inlineWriteUint16(opts);
          case 4:
            return inlineWriteUint32(opts);
          default:
            throw new Error(`Invalid int size: ${size}.`);
        }
      } else {
        switch (size) {
          case 4:
            return inlineWriteUint32(opts);
          case 8:
            return inlineWriteUint64(opts);
          default:
            throw new Error(`Invalid float size ${size}.`);
        }
      }
    }
    case "bytes":
    case "utf8":
    case "ascii":
      return line(callFunc("copy", [to.slice({ start: start, startOffset: offset }), from.value]));
    case "array":
      break;
    case "schema":
      return line(callMethod(from.value, "Pck", [to.slice({ start: start, startOffset: offset })]));
  }

  throw new Error(`Invalid fixed type: ${type}.`);
}

function writeDynamicType(
  binder: GoBinder,
  type: Type,
  from: Value,
  to: Value,
): TChildren {
  switch (type.id) {
    case "varint":
      return type.signed
        ? line(OFFSET, " += ", writeIvar(to.slice({ start: OFFSET }), from.value))
        : line(OFFSET, " += ", writeUvar(to.slice({ start: OFFSET }), from.value));
    case "bytes":
    case "utf8":
    case "ascii":
      return [
        line(OFFSET, " += ", writeUvar(to.slice({ start: OFFSET }), len(from.value))),
        line(OFFSET, " += ", callFunc("copy", [to.slice({ start: OFFSET }), from.value])),
      ];
    case "array":
    case "map":
      return "TODO";
    case "schema":
      return line(OFFSET, " += ", callMethod(from.value, "Pck", [to.slice({ start: OFFSET })]));
    case "union":
      return [
        line(OFFSET, " += ", callMethod(from.value, "PckTag", [to.slice({ start: OFFSET })])),
        line(OFFSET, " += ", callMethod(from.value, "Pck", [to.slice({ start: OFFSET })])),
      ];
  }

  throw new Error(`Invalid dynamic type: ${type}.`);
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
