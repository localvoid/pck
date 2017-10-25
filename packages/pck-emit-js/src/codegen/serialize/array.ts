import { TChildren } from "osh";
import { Type } from "pck";
import { pck } from "../utils";

export function arrayWriterFromType(type: Type): TChildren {
  const size = type.size;

  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return pck("writeIVar");
      } else {
        return pck("writeUVar");
      }
    }
    if (type.isInteger()) {
      switch (size) {
        case 1:
          return pck("writeI8");
        case 2:
          return pck("writeI16");
        case 4:
          return pck("writeI32");
        default:
          throw new Error(`Unable to emit writer callsite for a type: ${type}. Invalid size for an Int field.`);
      }
    }
    if (type.isFloat()) {
      switch (size) {
        case 4:
          return pck("writeF32");
        case 8:
          return pck("writeF64");
        default:
          throw new Error(`Unable to emit writer callsite for a field: ${type}. Invalid size for a Float field.`);
      }
    }
  }
  if (type.isString()) {
    if (type.isUtf8String()) {
      return pck("writeUtf8");
    } else {
      if (type.hasDynamicSize()) {
        return pck("writeAscii");
      } else {
        if (size > 128) {
          return pck("writeLongFixedAscii");
        } else {
          return pck("writeUtf8");
        }
      }
    }
  }
  if (type.isByteArray()) {
    if (type.hasDynamicSize()) {
      return pck("writeBytes");
    } else {
      return pck("writeFixedBytes");
    }
  }
  if (type.isRef()) {
    return pck("writeObject");
  }
  if (type.isOneOf()) {
    return pck("writeTaggedObject");
  }
  throw new Error("Invalid type");
}
