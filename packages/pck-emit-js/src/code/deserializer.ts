import { Field } from "pck";
import { Context, componentFactory, ComponentNode, TChildren } from "osh";
import { line, indent, comment } from "osh-code";
import { call, v, fieldToString } from "./utils";
import { pck } from "./modules";
import {
  getSchema, schemaName, schemaType, bitSetOptionalIndex, bitSetOptionalPosition, bitSetBooleanIndex,
  bitSetBooleanPosition, fieldName,
} from "./schema";

export const deserializer: (field: Field<any>) => ComponentNode<Field<any>> =
  componentFactory((ctx: Context, field: Field<any>) => {
    const t = field.type;
    const s = t.size;
    if (t.isNumber()) {
      if (t.isVariadicInteger()) {
        if (t.isSignedInteger()) {
          return call(pck("readIVar"), [v("buffer")]);
        } else {
          return call(pck("readUVar"), [v("buffer")]);
        }
      }
      if (t.isInteger()) {
        if (t.isSignedInteger()) {
          switch (s) {
            case 1:
              return call(pck("readI8"), [v("buffer")]);
            case 2:
              return call(pck("readI16"), [v("buffer")]);
            case 4:
              return call(pck("readI32"), [v("buffer")]);
            default:
              throw new Error(`Unable to emit read callsite for a field: ${field}. Invalid size for an Int field.`);
          }
        } else {
          switch (t.size) {
            case 1:
              return call(pck("readU8"), [v("buffer")]);
            case 2:
              return call(pck("readU16"), [v("buffer")]);
            case 4:
              return call(pck("readU32"), [v("buffer")]);
            default:
              throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid size for an Uint field.`);
          }
        }
      }
      if (t.isFloat()) {
        switch (s) {
          case 4:
            return call(pck("readF32"), [v("buffer")]);
          case 8:
            return call(pck("readF64"), [v("buffer")]);
          default:
            throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid size for a Float field.`);
        }
      }
    }
    if (t.isString()) {
      if (t.isUtf8String()) {
        return call(pck("readUtf8"), [v("buffer")]);
      } else {
        if (t.hasDynamicSize()) {
          return call(pck("readAscii"), [v("buffer")]);
        } else {
          return call(pck("readFixedAscii"), [v("buffer"), s]);
        }
      }
    }
    if (t.isByteArray()) {
      if (t.hasDynamicSize()) {
        return call(pck("readBytes"), [v("buffer")]);
      } else {
        return call(pck("readFixedBytes"), [v("buffer"), s]);
      }
    }
    if (t.isArray()) {
      if (t.hasDynamicSize()) {
        return call(pck("readArray"), [v("buffer")]);
      } else {
        return call(pck("readFixedArray"), [v("buffer"), s]);
      }
    }
    if (t.isRef()) {
      return call(["read", schemaName(t.props)], [v("buffer")]);
    }

    throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid field type.`);
  });

function bitSetMaxSize(size: number): number {
  if (size > 3) {
    return 4;
  }
  if (size > 1) {
    return 2;
  }
  return 1;
}

function bitSetSizes(size: number): number[] {
  const r = [];
  while (size > 0) {
    const n = bitSetMaxSize(size);
    r.push(n);
    size -= n;
  }
  return r;
}

function checkBitSetOptional(f: Field): TChildren {
  return ["(bitSet", bitSetOptionalIndex(f), " & (1 << ", bitSetOptionalPosition(f), ")) !== 0"];
}

function checkBitSetBoolean(f: Field): TChildren {
  return ["(bitSet", bitSetBooleanIndex(f), " & (1 << ", bitSetBooleanPosition(f), ")) !== 0"];
}

export const deserializeBitSet = componentFactory((ctx: Context) => {
  const schema = getSchema(ctx);

  return [
    comment("BitSet:"),
    bitSetSizes(schema.bitSetSize()).map((s, i) => (
      line(`const bitSet${i} = `, pck(`readU${s * 8}`), "(", v("buffer"), ")")),
    ),
    line(),
    schema.hasBooleanFields() ?
      [
        comment("Boolean Fields:"),
        schema.fields.map((f) => [
          comment(fieldToString(f)),
          line(
            "const ", fieldName(f), " = ",
            f.isOptional() ?
              [checkBitSetOptional(f), " ? ", checkBitSetBoolean(f), " : null"] :
              checkBitSetBoolean(f),
            ";",
          ),
        ]),
      ] : null,
  ];
});

export const deserializeBody = componentFactory((ctx: Context) => {
  const schema = getSchema(ctx);

  return [
    schema.hasBitSet() ? deserializeBitSet() : null,
    schema.hasRegularFields() ?
      [
        comment("Regular Fields:"),
        schema.fields.map((f) => f.type.isBoolean() ?
          null :
          line(
            comment(fieldToString(f)),
            "const ", fieldName(f), " = ",
            f.isOptional() ?
              [checkBitSetOptional(f), " ? ", deserializer(f), " : null"] :
              deserializer(f),
            ";",
          ),
        ),
      ] : null,
    line(),
    line("return new ", schemaType(schema), "("),
    indent(line(schema.fields.map((f) => [fieldName(f), ","]))),
    line(");"),
  ];
});