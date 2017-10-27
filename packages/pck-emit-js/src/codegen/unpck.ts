import { Context, ComponentNode, TChildren, component } from "osh";
import { Schema, Field, Type } from "pck";
import { line, indent, docComment, scope, declSymbol } from "osh-code";
import { ts } from "osh-code-js";
import {
  BIT_SETS, FIELD_VALUES, arg, pck, getSchema, schemaType, fieldValue, bitSet, call,
  bitSetOptionalIndex, bitSetOptionalPosition, bitSetBooleanIndex, bitSetBooleanPosition,
} from "./utils";

export function UnpckFunctionBody(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return scope({
    type: FIELD_VALUES,
    symbols: schema.fields.map((f) => declSymbol(f, f.name)),
    children: scope({
      type: BIT_SETS,
      symbols: bitSetSizes(schema.bitSetSize()).map((s, i) => declSymbol(i, `bitSet${0}`)),
      children: [
        schema.hasBitSet() ? [
          bitSetSizes(schema.bitSetSize()).map((s, i) => (
            line("const ", bitSet(i), " = ", call(pck(`readU${s * 8}`), [arg("reader")]), ";")),
          ),
          schema.hasBooleanFields() ?
            schema.booleanFields.map((f) => (
              line("const ", fieldValue(f), " = ", checkBitSetBoolean(schema, f), ";")),
            ) : null,
        ] : null,
        schema.hasRegularFields() ?
          schema.sortedFields.map((f) => !f.type.isBoolean() ?
            [
              line(
                "const ", fieldValue(f), " = ",
                f.isOptional() ?
                  [checkBitSetOptional(schema, f), " ? ", deserializeField(f), " : ", defaultValue(f)] :
                  deserializeField(f),
                ";",
              ),
            ] : null,
          ) : null,
        line(),
        line("return new ", schemaType(schema), "("),
        indent(schema.fields.map((f) => line(fieldValue(f), ","))),
        line(");"),
      ],
    }),
  });
}

export function unpckFunctionBody(): ComponentNode<undefined> {
  return component(UnpckFunctionBody);
}

export function UnpckFunction(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return [
    docComment(
      line("unpck", schemaType(schema), " is an automatically generated deserialization function."),
      line(),
      line("@param ", arg("reader"), " Read buffer."),
      line("@returns Deserialized object."),
    ),
    line(
      "export function unpck", schemaType(schema), "(",
      arg("reader"), ts(": ", pck("ReadBuffer")),
      ")", ts(": ", schemaType(schema)), " {",
    ),
    indent(unpckFunctionBody()),
    line("}"),
  ];
}

export function unpckFunction(): ComponentNode<undefined> {
  return component(UnpckFunction);
}

function defaultValue(f: Field) {
  if (f.isOmitNull()) {
    return "null";
  }
  if (f.isOmitEmpty()) {
    if (f.type.isArray()) {
      return "[]";
    }
    if (f.type.isString()) {
      return `""`;
    }
    return "null"; // ByteArray
  }
  if (f.isOmitZero()) {
    return "0";
  }
  throw new Error("Field cannot have default value");
}

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

function checkBitSetOptional(schema: Schema, field: Field<any>): TChildren {
  return [
    "(", bitSet(bitSetOptionalIndex(schema, field)),
    " & (1 << ", bitSetOptionalPosition(schema, field), ")) !== 0",
  ];
}

function checkBitSetBoolean(schema: Schema, field: Field<any>): TChildren {
  return [
    "(", bitSet(bitSetBooleanIndex(schema, field)),
    " & (1 << ", bitSetBooleanPosition(schema, field), ")) !== 0",
  ];
}

function deserializeField(field: Field<any>): TChildren {
  const t = field.type;
  const s = t.size;
  if (t.isNumber()) {
    if (t.isVariadicInteger()) {
      if (t.isSignedInteger()) {
        return readIVar();
      } else {
        return readUVar();
      }
    }
    if (t.isInteger()) {
      if (t.isSignedInteger()) {
        switch (s) {
          case 1:
            return readI8();
          case 2:
            return readI16();
          case 4:
            return readI32();
          default:
            throw new Error(`Unable to emit read callsite for a field: ${field}. Invalid size for an Int field.`);
        }
      } else {
        switch (t.size) {
          case 1:
            return readU8();
          case 2:
            return readU16();
          case 4:
            return readU32();
          default:
            throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid size for an Uint field.`);
        }
      }
    }
    if (t.isFloat()) {
      switch (s) {
        case 4:
          return readF32();
        case 8:
          return readF64();
        default:
          throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid size for a Float field.`);
      }
    }
  }
  if (t.isString()) {
    if (t.isUtf8String()) {
      return readUtf8();
    } else {
      if (t.hasDynamicSize()) {
        return readAscii();
      } else {
        if (s > 127) {
          return readLongFixedAscii(s);
        }
        return readFixedUtf8(s);
      }
    }
  }
  if (t.isByteArray()) {
    if (t.hasDynamicSize()) {
      return readBytes();
    } else {
      return readFixedBytes(s);
    }
  }
  if (t.isArray()) {
    if (t.hasDynamicSize()) {
      return readArray(arrayReaderFromType(t.props.type));
    } else {
      return readFixedArray(arrayReaderFromType(t.props.type), s);
    }
  }
  if (t.isRef()) {
    return readRef(schemaType(t.props));
  }

  throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid field type.`);
}

function readI8(): TChildren {
  return call(pck("readI8"), [arg("reader")]);
}

function readI16(): TChildren {
  return call(pck("readI16"), [arg("reader")]);
}

function readI32(): TChildren {
  return call(pck("readI32"), [arg("reader")]);
}

function readU8(): TChildren {
  return call(pck("readU8"), [arg("reader")]);
}

function readU16(): TChildren {
  return call(pck("readU16"), [arg("reader")]);
}

function readU32(): TChildren {
  return call(pck("readU32"), [arg("reader")]);
}

function readF32(): TChildren {
  return call(pck("readF32"), [arg("reader")]);
}

function readF64(): TChildren {
  return call(pck("readF64"), [arg("reader")]);
}

function readIVar(): TChildren {
  return call(pck("readIVar"), [arg("reader")]);
}

function readUVar(): TChildren {
  return call(pck("readUVar"), [arg("reader")]);
}

function readUtf8(): TChildren {
  return call(pck("readUtf8"), [arg("reader")]);
}

function readFixedUtf8(length: TChildren): TChildren {
  return call(pck("readLongFixedUtf8"), [arg("reader"), length]);
}

function readAscii(): TChildren {
  return call(pck("readAscii"), [arg("reader")]);
}

function readLongFixedAscii(length: TChildren): TChildren {
  return call(pck("readLongFixedAscii"), [arg("reader"), length]);
}

function readBytes(): TChildren {
  return call(pck("readBytes"), [arg("reader")]);
}

function readFixedBytes(length: TChildren): TChildren {
  return call(pck("readFixedBytes"), [arg("reader"), length]);
}

function readArray(arrayReader: TChildren): TChildren {
  return call(pck("readArray"), [arg("reader"), arrayReader]);
}

function readFixedArray(arrayReader: TChildren, size: number): TChildren {
  return call(pck("readFixedArray"), [arg("reader"), arrayReader, size]);
}

function readRef(value: TChildren): TChildren {
  return call(["unpck", value], [arg("reader")]);
}

function arrayReaderFromType(t: Type): TChildren {
  const size = t.size;

  if (t.isNumber()) {
    if (t.isVariadicInteger()) {
      if (t.isSignedInteger()) {
        return pck("readIVar");
      } else {
        return pck("readUVar");
      }
    }
    if (t.isInteger()) {
      if (t.isSignedInteger()) {
        switch (size) {
          case 1:
            return pck("readI8");
          case 2:
            return pck("readI16");
          case 4:
            return pck("readI32");
          default:
            throw new Error(`Unable to emit reader callsite for a type: ${t}. Invalid size for an Int field.`);
        }
      } else {
        switch (size) {
          case 1:
            return pck("readU8");
          case 2:
            return pck("readU16");
          case 4:
            return pck("readU32");
          default:
            throw new Error(`Unable to emit reader callsite for a type: ${t}. Invalid size for an UInt field.`);
        }
      }
    }
    if (t.isFloat()) {
      switch (size) {
        case 4:
          return pck("readF32");
        case 8:
          return pck("readF64");
        default:
          throw new Error(`Unable to emit reader callsite for a field: ${t}. Invalid size for a Float field.`);
      }
    }
  }
  if (t.isString()) {
    if (t.isUtf8String()) {
      return pck("readUtf8");
    } else {
      if (t.hasDynamicSize()) {
        return pck("readAscii");
      } else {
        if (size > 128) {
          return pck("readLongFixedAscii");
        } else {
          return pck("readUtf8");
        }
      }
    }
  }
  if (t.isByteArray()) {
    if (t.hasDynamicSize()) {
      return pck("readBytes");
    } else {
      return pck("readFixedBytes");
    }
  }
  if (t.isRef()) {
    return pck("readObject");
  }
  if (t.isUnion()) {
    return pck("readTaggedObject");
  }
  throw new Error("Invalid type");
}
