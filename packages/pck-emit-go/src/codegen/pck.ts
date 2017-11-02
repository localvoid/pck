import { TChildren } from "osh";
import { line, indent, docComment, declSymbol } from "osh-code";
import { Schema, Field } from "pck";
import {
  enterSchema, declArgs, declVars, declOptionals, arg, self, v, optional, structName, fieldName, len,
  castToByte,
} from "./utils";
import { writeUvar, writeIvar } from "./lib";

export function pckMethod(schema: Schema): TChildren {
  return (
    enterSchema(schema,
      declArgs(
        [
          declSymbol("self", "s"),
          declSymbol("buf", "b"),
        ],
        declVars(["offset", "bitSetValue"],
          declOptionals(schema.optionalFields,
            [
              docComment(
                line("Pck is an automatically generated method for PCK serialization."),
              ),
              line("func (", self(), " *", structName(schema), ") Pck(", arg("buf"), " []byte) int {"),
              indent(
                (schema.getFixedSize() > 1) ?
                  boundCheckHint(schema.getFixedSize() - 1) :
                  null,
                schema.hasBitSet() ? line("var ", v("bitSetValue"), " uint8") : null,
                schema.hasOptionalFields() ?
                  schema.optionalFields.map((f) => line(optional(f), " := ", checkOptional(f))) :
                  null,
                schema.hasBitSet() ? putBitSet(schema) : null,
                putFields(schema),
                line("return ", schema.hasDynamicSize() ? v("offset") : schema.getFixedSize()),
              ),
              line("}"),
            ],
          ),
        ),
      ),
    )
  );
}

function putBitSet(schema: Schema): TChildren {
  const result = [];
  let bitSetIndex = 0;
  let offset = 0;

  for (let i = 0; i < schema.bitSet.length; i++) {
    const bitField = schema.bitSet[i];

    result.push(
      bitField.isOptional() ?
        line("if ", optional(bitField.field), " {") :
        line("if ", self(fieldName(bitField.field)), " {"),
      indent(
        bitSetIndex === 0 ?
          line(v("bitSetValue"), " = 1") :
          line(v("bitSetValue"), " |= 1 << ", bitSetIndex),
      ),
      line("}"),
    );
    if (++bitSetIndex === 8) {
      bitSetIndex = 0;
      result.push([
        line(buf(offset, v("bitSetValue"))),
        (i < (schema.bitSet.length - 1)) ?
          line(v("bitSetValue"), " = 0") :
          null,
      ]);
      offset++;
    }
  }
  if (bitSetIndex > 0) {
    result.push(line(buf(offset, v("bitSetValue"))));
    offset++;
  }
  advanceOffset(offset);

  return result;
}

function putFields(schema: Schema): TChildren {
  const r = [];
  let offset = schema.getBitSetSize();
  for (const field of schema.sortedFixedFields) {
    if (!field.type.isBoolean()) {
      r.push(
        putFixedField(field, offset),
      );
      offset += field.type.size;
    }
  }
  if (schema.hasDynamicSize()) {
    r.push(line(v("offset"), " := ", offset));
  }
  for (const field of schema.sortedDynamicFields) {
    if (field.isOptional()) {
      r.push(
        line("if ", optional(field), " {"),
        indent(
          putDynamicField(field),
        ),
        line("}"),
      );
    } else {
      r.push(
        putDynamicField(field),
      );
    }
  }

  return r;
}

function putFixedField(field: Field<any>, offset: number): TChildren {
  const type = field.type;
  const size = type.size;

  if (field.isFixed()) {
    if (type.isNumber()) {
      if (type.isInteger()) {
        if (type.isSignedInteger()) {
          switch (size) {
            case 1:
              return inlineWriteUint8(self(fieldName(field)), offset);
            case 2:
              return inlineWriteUint16(self(fieldName(field)), offset);
            case 4:
              return inlineWriteUint32(self(fieldName(field)), offset);
            default:
              throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Int field.`);
          }
        } else {
          switch (size) {
            case 1:
              return inlineWriteUint8(self(fieldName(field)), offset);
            case 2:
              return inlineWriteUint16(self(fieldName(field)), offset);
            case 4:
              return inlineWriteUint32(self(fieldName(field)), offset);
            default:
              throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Uint field.`);
          }
        }
      }
      if (type.isFloat()) {
        switch (size) {
          case 4:
            return inlineWriteUint32(self(fieldName(field)), offset);
          case 8:
            return inlineWriteUint64(self(fieldName(field)), offset);
          default:
            throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for a Float field.`);
        }
      }
    }

    if (type.isString() || type.isByteArray()) {
      return putCopy(self(fieldName(field)), offset);
    }

    if (type.isRef()) {
      return line(self(fieldName(field)), ".Pck(", bufSlice(offset), ")");
    }

    throw new Error("Invalid field type.");
  }

  throw new Error("putFixedField doesn't work with dynamic fields.");
}

function putDynamicField(field: Field<any>): TChildren {
  const type = field.type;

  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return line(v("offset"), " += ", writeIvar(bufSlice(v("offset")), self(fieldName(field))));
      } else {
        return line(v("offset"), " += ", writeUvar(bufSlice(v("offset")), self(fieldName(field))));
      }
    }
  }
  if (type.isString() || type.isByteArray()) {
    return [
      line(v("offset"), " += ", writeUvar(bufSlice(v("offset")), len(self(fieldName(field))))),
      line(v("offset"), " += ", "copy(", bufSlice(v("offset")), ", ", self(fieldName(field)), ")"),
    ];
  }

  if (type.isArray()) {
    if (type.hasDynamicSize()) {
      return [];
    } else {
      return [];
    }
  }

  if (type.isRef()) {
    return line(v("offset"), " += ", self(fieldName(field)), ".Pck(", bufSlice(v("offset")), ")");
  }

  throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid field type.`);
}

function checkOptional(field: Field<any>): TChildren {
  if (field.isOmitNull()) {
    if (field.isOmitEmpty()) {
      return [
        self(fieldName(field)), " != nil",
        " && ",
        "len(", self(fieldName(field)), ") > 0",
      ];
    }
    return [self(fieldName(field)), " != nil"];
  }
  if (field.isOmitEmpty()) {
    return ["len(", self(fieldName(field)), ") > 0"];
  }

  if (field.isOmitZero()) {
    return [self(fieldName(field)), "!= 0"];
  }

  throw new Error("Unreachable");
}

function buf(offset?: TChildren, value?: TChildren): TChildren {
  if (offset === void 0) {
    return arg("buf");
  }
  if (value === void 0) {
    return [arg("buf"), "[", offset, "]"];
  }
  return [arg("buf"), "[", offset, "]", " = ", value];
}

function bufSlice(start: TChildren, end?: TChildren): TChildren {
  return [arg("buf"), "[", start, ":", end === void 0 ? null : end, "]"];
}

/**
 * https://golang.org/src/encoding/binary/binary.go
 * https://golang.org/issue/14808
 *
 * @param offset Bound check offset
 */
function boundCheckHint(offset: number): TChildren {
  return line("_ = ", buf(offset));
}

function advanceOffset(n: number): TChildren {
  if (n === 1) {
    return line(v("offset"), "++");
  }
  return line(v("offset"), " += ", n);
}

function putCopy(value: TChildren, offset?: number): TChildren {
  if (offset === void 0) {
    return line(v("offset"), " += ", "copy(", bufSlice(v("offset")), ", ", value, ")");
  }
  return line("copy(", bufSlice(offset), ", ", value, ")");
}

function inlineWriteUint8(value: TChildren, offset?: number): TChildren {
  if (offset === void 0) {
    return [
      line(buf(v("offset"), castToByte(value))),
      advanceOffset(1),
    ];
  }
  return line(buf(offset, castToByte(value)));
}

function inlineWriteUint16(value: TChildren, offset?: number): TChildren {
  if (offset === void 0) {
    return [
      line(buf(v("offset"), castToByte(value))),
      line(buf([v("offset"), " + 1"], castToByte([value, " >> 8"]))),
      advanceOffset(2),
    ];
  }
  return [
    line(buf(offset, castToByte(value))),
    line(buf(offset + 1, castToByte([value, " >> 8"]))),
  ];
}

function inlineWriteUint32(value: TChildren, offset?: number): TChildren {
  if (offset === void 0) {
    return [
      line(buf(v("offset"), castToByte(value))),
      line(buf([v("offset"), " + 1"], castToByte(value, " >> 8"))),
      line(buf([v("offset"), " + 2"], castToByte(value, " >> 16"))),
      line(buf([v("offset"), " + 3"], castToByte(value, " >> 24"))),
      advanceOffset(4),
    ];
  }
  return [
    line(buf(offset, castToByte(value))),
    line(buf(offset + 1, castToByte(value, " >> 8"))),
    line(buf(offset + 2, castToByte(value, " >> 16"))),
    line(buf(offset + 3, castToByte(value, " >> 24"))),
  ];
}

function inlineWriteUint64(value: TChildren, offset?: number): TChildren {
  if (offset === void 0) {
    return [
      line(buf(v("offset"), castToByte(value))),
      line(buf([v("offset"), " + 1"], castToByte(value, " >> 8"))),
      line(buf([v("offset"), " + 2"], castToByte(value, " >> 16"))),
      line(buf([v("offset"), " + 3"], castToByte(value, " >> 24"))),
      line(buf([v("offset"), " + 4"], castToByte(value, " >> 32"))),
      line(buf([v("offset"), " + 5"], castToByte(value, " >> 40"))),
      line(buf([v("offset"), " + 6"], castToByte(value, " >> 48"))),
      line(buf([v("offset"), " + 7"], castToByte(value, " >> 56"))),
      advanceOffset(4),
    ];
  }
  return [
    line(buf(offset, castToByte(value))),
    line(buf(offset + 1, castToByte(value, " >> 8"))),
    line(buf(offset + 2, castToByte(value, " >> 16"))),
    line(buf(offset + 3, castToByte(value, " >> 24"))),
    line(buf(offset + 4, castToByte(value, " >> 32"))),
    line(buf(offset + 5, castToByte(value, " >> 40"))),
    line(buf(offset + 6, castToByte(value, " >> 48"))),
    line(buf(offset + 7, castToByte(value, " >> 56"))),
  ];
}
