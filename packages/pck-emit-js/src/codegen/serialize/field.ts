import { TChildren } from "osh";
import { Field } from "pck";
import {
  writeIVar, writeUVar, writeI8, writeI16, writeI32, writeF32, writeF64, writeUtf8, writeAscii, writeLongFixedAscii,
  writeBytes, writeFixedBytes, writeArray, writeFixedArray, writeRef,
} from "./writers";
import { arrayWriterFromType } from "./array";
import { getter } from "../utils";

export function serializeField(field: Field<any>): TChildren {
  const type = field.type;
  const size = type.size;

  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return writeIVar(getter(field));
      } else {
        return writeUVar(getter(field));
      }
    }
    if (type.isInteger()) {
      if (type.isSignedInteger()) {
        switch (size) {
          case 1:
            return writeI8(getter(field));
          case 2:
            return writeI16(getter(field));
          case 4:
            return writeI32(getter(field));
          default:
            throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Int field.`);
        }
      } else {
        switch (size) {
          case 1:
            return writeI8(getter(field));
          case 2:
            return writeI16(getter(field));
          case 4:
            return writeI32(getter(field));
          default:
            throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Uint field.`);
        }
      }
    }
    if (type.isFloat()) {
      switch (size) {
        case 4:
          return writeF32(getter(field));
        case 8:
          return writeF64(getter(field));
        default:
          throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for a Float field.`);
      }
    }
  }
  if (type.isString()) {
    if (type.isUtf8String()) {
      return writeUtf8(getter(field));
    } else {
      if (type.hasDynamicSize()) {
        return writeAscii(getter(field));
      } else {
        if (size > 128) {
          return writeLongFixedAscii(getter(field), size);
        } else {
          return writeUtf8(getter(field));
        }
      }
    }
  }
  if (type.isByteArray()) {
    if (type.hasDynamicSize()) {
      return writeBytes(getter(field));
    } else {
      return writeFixedBytes(getter(field), size);
    }
  }
  if (type.isArray()) {
    if (type.hasDynamicSize()) {
      return writeArray(getter(field), arrayWriterFromType(type.props.type));
    } else {
      return writeFixedArray(getter(field), arrayWriterFromType(type.props.type));
    }
  }
  if (type.isRef()) {
    return writeRef(getter(field));
  }

  throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid field type.`);
}
