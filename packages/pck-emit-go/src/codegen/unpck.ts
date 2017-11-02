import { TChildren } from "osh";
import { docComment, line, indent, declSymbol } from "osh-code";
import { Schema, Type } from "pck";
import {
  enterSchema, declArgs, declVars, self, arg, v, structName, fieldName,
  castToInt8, castToInt16, castToInt32, castToFloat, castToDouble, castToString,
} from "./utils";
import {
  InlineReadIntOptions, inlineReadUint8, inlineReadUint16, inlineReadUint32, inlineReadUint64, readIvar, readUvar,
} from "./lib";

// const SELF = arg("self");
const BUF = arg("buf");
const OFFSET = v("offset");
const LENGTH = v("length");
const VALUE = v("value");
const SIZE = v("size");
const I = v("i");

export function unpckMethod(schema: Schema): TChildren {
  const bitSetVars = [];
  for (let i = 0; i < schema.getBitSetSize(); i++) {
    bitSetVars.push(`bitSet${i}`);
  }

  return (
    enterSchema(schema,
      declArgs(
        [
          declSymbol("self", "s"),
          declSymbol("buf", "b"),
        ],
        declVars(
          [
            ...bitSetVars,
            "offset",
            "length",
            "value",
            "size",
            "i",
          ],
          [
            docComment(
              line("Unpck is an automatically generated method for PCK deserialization."),
            ),
            line("func (", self(), " *", structName(schema), ") Unpck(", BUF, " []byte) int {"),
            indent(
              (schema.getFixedSize() > 1) ?
                boundCheckHint(schema.getFixedSize() - 1) :
                null,
              readBitSet(schema),
              readFields(schema),
              line("return ", schema.hasDynamicSize() ? v("offset") : schema.getFixedSize()),
            ),
            line("}"),
          ],
        ),
      ),
    )
  );
}

function readBitSet(schema: Schema): TChildren {
  const r = [];
  for (let i = 0; i < schema.getBitSetSize(); i++) {
    r.push(line(bitSet(i), " := ", buf(i)));
  }
  return r;
}

function readFields(schema: Schema): TChildren {
  const r = [];
  if (schema.hasBitSet()) {
    if (schema.bitSet.length === 1) {
      if (schema.booleanFields.length === 1) {
        const field = schema.booleanFields[0];
        r.push(line(self(fieldName(field)), " = ", bitSet(0), " != 0"));
      }
    } else {
      for (const field of schema.booleanFields) {
        const bitField = schema.getBifField(field, true);
        const index = bitField.index % 8;
        r.push(line(self(fieldName(field)), " = ", bitSet(bitField.offset), "&(1<<", index, ") != 0"));
      }
    }
  }

  let offset = schema.getBitSetSize();
  for (const field of schema.sortedFixedFields) {
    if (!field.type.isBoolean()) {
      r.push(readFixedType(field.type, buf, self(fieldName(field)), offset));
      offset += field.type.size;
    }
  }

  if (schema.hasDynamicSize()) {
    r.push(line(OFFSET, " := ", offset));

    for (const field of schema.sortedDynamicFields) {
      r.push(readDynamicType(field.type, (off) => bufSlice([OFFSET, " + ", off]), self(fieldName(field))));
    }
  }

  return r;
}

function readFixedType(
  type: Type<any>,
  from: (offset?: TChildren) => TChildren,
  to: TChildren,
  offset: number,
): TChildren {
  const size = type.size;
  if (type.isNumber()) {
    const opts: InlineReadIntOptions = {
      from: from,
      to: to,
      offset: offset,
      cast: undefined,
    };
    if (type.isInteger()) {
      if (type.isSignedInteger()) {
        switch (size) {
          case 1:
            return inlineReadUint8(opts);
          case 2:
            return inlineReadUint16(opts);
          case 4:
            return inlineReadUint32(opts);
          default:
            throw new Error(`Invalid int size: ${size}.`);
        }
      } else {
        switch (size) {
          case 1:
            opts.cast = castToInt8;
            return inlineReadUint8(opts);
          case 2:
            opts.cast = castToInt16;
            return inlineReadUint16(opts);
          case 4:
            opts.cast = castToInt32;
            return inlineReadUint32(opts);
          default:
            throw new Error(`Invalid uint size: ${size}.`);
        }
      }
    }
    if (type.isFloat()) {
      switch (size) {
        case 4:
          opts.cast = castToFloat;
          return inlineReadUint32(opts);
        case 8:
          opts.cast = castToDouble;
          return inlineReadUint64(opts);
        default:
          throw new Error(`Invalid float size ${size}.`);
      }
    }
  }

  if (type.isString()) {
    return line(to, " = ", castToString(bufSlice(offset, type.size)));
  }

  if (type.isByteArray()) {
    return line(to, " = ", bufSlice(offset, type.size));
  }

  if (type.isArray()) {
    if (type.props.length < 4) {
      const r = [];
      for (let i = 0; i < type.props.length; i++) {
        r.push(readFixedType(type.props.type, from, [to, "[", i, "]"], offset + i));
      }
      return r;
    } else {
      return [
        line(
          "for ", I, ", ", OFFSET, " := 0, ", offset, "; ",
          OFFSET, " < ", offset + (type.props.length * type.props.type.size), "; ",
          I, ", ", OFFSET, " = ", I, ", ", OFFSET, " = ",
          I, " + 1, ", OFFSET, " + ", type.props.type.size, " {",
        ),
        indent(
          readFixedType(type.props.type, (o) => from([OFFSET, " + ", o]), [to, "[", I, "]"], 0),
        ),
        line("}"),
      ];
    }
  }

  if (type.isRef()) {
    return [
      line("{"),
      indent(
        line(VALUE, " := &", structName(type.props), "{}"),
        line(VALUE, ".Unpck(", bufSlice(offset), ")"),
        line(to, " = value"),
      ),
      line("}"),
    ];
  }
  throw new Error(`Invalid fixed type: ${type}.`);
}

function readDynamicType(
  type: Type<any>,
  from: (offset?: TChildren) => TChildren,
  to: TChildren,
): TChildren {
  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return [
          line("{"),
          indent(
            line(VALUE, ", ", SIZE, " := ", readIvar(from(0))),
            line(to, " = ", VALUE),
            line(OFFSET, " += ", SIZE),
          ),
          line("}"),
        ];
      } else {
        return [
          line("{"),
          indent(
            line(VALUE, ", ", SIZE, " := ", readUvar(from(0))),
            line(to, " = ", VALUE),
            line(OFFSET, " += ", SIZE),
          ),
          line("}"),
        ];
      }
    }
  }
  if (type.isString()) {
    return [
      line("{"),
      indent(
        line(LENGTH, ", ", SIZE, " := ", readUvar(from(0))),
        line(OFFSET, " += ", SIZE),
        line(to, " = ", castToString(bufSlice(OFFSET, [OFFSET, " + ", LENGTH]))),
        line(OFFSET, " += ", LENGTH),
      ),
      line("}"),
    ];
  }
  if (type.isByteArray()) {
    return [
      line("{"),
      indent(
        line(LENGTH, ", ", SIZE, " := ", readUvar(from(0))),
        line(OFFSET, " += ", SIZE),
        line(to, " = ", bufSlice(OFFSET, [OFFSET, " + ", LENGTH])),
        line(OFFSET, " += ", LENGTH),
      ),
      line("}"),
    ];
  }

  if (type.isRef()) {
    return [
      line("{"),
      indent(
        line(VALUE, " := &", structName(type.props), "{}"),
        line(LENGTH, " := ", VALUE, ".Unpck(", bufSlice(OFFSET), ")"),
        line(OFFSET, " += ", LENGTH),
      ),
      line("}"),
    ];
  }
  throw new Error(`Invalid dynamic type: ${type}`);
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

function bitSet(i: number): TChildren {
  return v(`bitSet${i}`);
}

function buf(offset?: TChildren, value?: TChildren): TChildren {
  if (offset === void 0) {
    return BUF;
  }
  if (value === void 0) {
    return [BUF, "[", offset, "]"];
  }
  return [BUF, "[", offset, "]", " = ", value];
}

function bufSlice(start: TChildren, end?: TChildren): TChildren {
  return [BUF, "[", start, ":", end === void 0 ? null : end, "]"];
}
