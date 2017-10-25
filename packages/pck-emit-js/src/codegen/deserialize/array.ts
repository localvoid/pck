import { TChildren } from "osh";
import { Type } from "pck";
import { pck } from "../utils";

export function arrayReaderFromType(type: Type): TChildren {
  const size = type.size;

  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return pck("readIVar");
      } else {
        return pck("readUVar");
      }
    }
    if (type.isInteger()) {
      if (type.isSignedInteger()) {
        switch (size) {
          case 1:
            return pck("readI8");
          case 2:
            return pck("readI16");
          case 4:
            return pck("readI32");
          default:
            throw new Error(`Unable to emit reader callsite for a type: ${type}. Invalid size for an Int field.`);
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
            throw new Error(`Unable to emit reader callsite for a type: ${type}. Invalid size for an UInt field.`);
        }
      }
    }
    if (type.isFloat()) {
      switch (size) {
        case 4:
          return pck("readF32");
        case 8:
          return pck("readF64");
        default:
          throw new Error(`Unable to emit reader callsite for a field: ${type}. Invalid size for a Float field.`);
      }
    }
  }
  if (type.isString()) {
    if (type.isUtf8String()) {
      return pck("readUtf8");
    } else {
      if (type.hasDynamicSize()) {
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
  if (type.isByteArray()) {
    if (type.hasDynamicSize()) {
      return pck("readBytes");
    } else {
      return pck("readFixedBytes");
    }
  }
  if (type.isRef()) {
    return pck("readObject");
  }
  if (type.isOneOf()) {
    return pck("readTaggedObject");
  }
  throw new Error("Invalid type");
}
