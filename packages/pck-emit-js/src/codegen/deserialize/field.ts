import { TChildren } from "osh";
import { Field } from "pck";
import {
  readIVar, readUVar, readI8, readI16, readI32, readU8, readU16, readU32, readF32, readF64, readArray, readAscii,
  readBytes, readFixedArray, readFixedBytes, readFixedUtf8, readRef, readUtf8,
} from "./readers";
import { arrayReaderFromType } from "./array";
import { schemaType } from "../utils";

export function deserializeField(field: Field<any>): TChildren {
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
