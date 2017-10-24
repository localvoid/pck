import { Field, Type } from "pck";
import { Context, componentFactory, ComponentNode, TChildren } from "osh";
import { line, indent, comment, docComment } from "osh-code";
import { call, v, type, fieldToString } from "./utils";
import { pck } from "./modules";
import {
  getSchema, schemaType, bitSetOptionalIndex, bitSetOptionalPosition, bitSetBooleanIndex,
  bitSetBooleanPosition, fieldName,
} from "./schema";

function arrayReaderType(t: Type): string {
  const s = t.size;

  if (t.isNumber()) {
    if (t.isVariadicInteger()) {
      if (t.isSignedInteger()) {
        return "readIVar";
      } else {
        return "readUVar";
      }
    }
    if (t.isInteger()) {
      if (t.isSignedInteger()) {
        switch (s) {
          case 1:
            return "readI8";
          case 2:
            return "readI16";
          case 4:
            return "readI32";
          default:
            throw new Error(`Unable to emit writer callsite for a type: ${type}. Invalid size for an Int field.`);
        }
      } else {
        switch (s) {
          case 1:
            return "readU8";
          case 2:
            return "readU16";
          case 4:
            return "readU32";
          default:
            throw new Error(`Unable to emit writer callsite for a type: ${type}. Invalid size for an UInt field.`);
        }
      }
    }
    if (t.isFloat()) {
      switch (s) {
        case 4:
          return "readF32";
        case 8:
          return "readF64";
        default:
          throw new Error(`Unable to emit writer callsite for a field: ${type}. Invalid size for a Float field.`);
      }
    }
  }
  if (t.isString()) {
    if (t.isUtf8String()) {
      return "readUtf8";
    } else {
      if (t.hasDynamicSize()) {
        return "readAscii";
      } else {
        if (s > 128) {
          return "readLongFixedAscii";
        } else {
          return "readUtf8";
        }
      }
    }
  }
  if (t.isByteArray()) {
    if (t.hasDynamicSize()) {
      return "readBytes";
    } else {
      return "readFixedBytes";
    }
  }
  if (t.isRef()) {
    return "readObject";
  }
  if (t.isOneOf()) {
    return "readTaggedObject";
  }
  throw new Error("Invalid type");
}

export const deserializer: (field: Field<any>) => ComponentNode<Field<any>> =
  componentFactory((ctx: Context, field: Field<any>) => {
    const t = field.type;
    const s = t.size;
    if (t.isNumber()) {
      if (t.isVariadicInteger()) {
        if (t.isSignedInteger()) {
          return call(pck("readIVar"), [v("reader")]);
        } else {
          return call(pck("readUVar"), [v("reader")]);
        }
      }
      if (t.isInteger()) {
        if (t.isSignedInteger()) {
          switch (s) {
            case 1:
              return call(pck("readI8"), [v("reader")]);
            case 2:
              return call(pck("readI16"), [v("reader")]);
            case 4:
              return call(pck("readI32"), [v("reader")]);
            default:
              throw new Error(`Unable to emit read callsite for a field: ${field}. Invalid size for an Int field.`);
          }
        } else {
          switch (t.size) {
            case 1:
              return call(pck("readU8"), [v("reader")]);
            case 2:
              return call(pck("readU16"), [v("reader")]);
            case 4:
              return call(pck("readU32"), [v("reader")]);
            default:
              throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid size for an Uint field.`);
          }
        }
      }
      if (t.isFloat()) {
        switch (s) {
          case 4:
            return call(pck("readF32"), [v("reader")]);
          case 8:
            return call(pck("readF64"), [v("reader")]);
          default:
            throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid size for a Float field.`);
        }
      }
    }
    if (t.isString()) {
      if (t.isUtf8String()) {
        return call(pck("readUtf8"), [v("reader")]);
      } else {
        if (t.hasDynamicSize()) {
          return call(pck("readAscii"), [v("reader")]);
        } else {
          return call(pck("readFixedAscii"), [v("reader"), s]);
        }
      }
    }
    if (t.isByteArray()) {
      if (t.hasDynamicSize()) {
        return call(pck("readBytes"), [v("reader")]);
      } else {
        return call(pck("readFixedBytes"), [v("reader"), s]);
      }
    }
    if (t.isArray()) {
      if (t.hasDynamicSize()) {
        return call(pck("readArray"), [v("reader"), pck(arrayReaderType(t.props.type))]);
      } else {
        return call(pck("readFixedArray"), [v("reader"), pck(arrayReaderType(t.props.type)), s]);
      }
    }
    if (t.isRef()) {
      return call(["unpck", schemaType(t.props)], [v("reader")]);
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
  return ["(__bitSet", bitSetOptionalIndex(f), " & (1 << ", bitSetOptionalPosition(f), ")) !== 0"];
}

function checkBitSetBoolean(f: Field): TChildren {
  return ["(__bitSet", bitSetBooleanIndex(f), " & (1 << ", bitSetBooleanPosition(f), ")) !== 0"];
}

export const deserializeBitSet = componentFactory((ctx: Context) => {
  const schema = getSchema(ctx);

  return [
    comment("BitSet:"),
    bitSetSizes(schema.bitSetSize()).map((s, i) => (
      line(`const __bitSet${i} = `, call(pck(`readU${s * 8}`), [v("reader")]), ";")),
    ),
    line(),
    schema.hasBooleanFields() ?
      [
        comment("Boolean Fields:"),
        schema.booleanFields.map((f) => [
          comment(fieldToString(f)),
          line("const ", fieldName(f), " = ", checkBitSetBoolean(f), ";"),
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
          [
            comment(fieldToString(f)),
            line(
              "const ", fieldName(f), " = ",
              f.isOptional() ?
                [checkBitSetOptional(f), " ? ", deserializer(f), " : null"] :
                deserializer(f),
              ";",
            ),
          ],
        ),
      ] : null,
    line(),
    line("return new ", schemaType(schema), "("),
    indent(schema.fields.map((f) => line(fieldName(f), ","))),
    line(");"),
  ];
});

export const deserializeFunction = componentFactory((ctx: Context) => {
  const schema = getSchema(ctx);

  return [
    docComment(
      line("unpck", schemaType(schema), " is an automatically generated deserialization function."),
      line(),
      line("@param ", v("reader"), " Read buffer."),
      line("@returns Deserialized object."),
    ),
    line(
      "export function unpck", schemaType(schema), "(",
      v("reader"), type(": ", pck("ReadBuffer")),
      ")", type(": ", schemaType(schema)), " {",
    ),
    indent(deserializeBody()),
    line("}"),
  ];
});
