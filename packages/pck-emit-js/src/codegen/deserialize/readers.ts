import { TChildren } from "osh";
import { call, arg, pck } from "../utils";

export function readI8(): TChildren {
  return call(pck("readI8"), [arg("reader")]);
}

export function readI16(): TChildren {
  return call(pck("readI16"), [arg("reader")]);
}

export function readI32(): TChildren {
  return call(pck("readI32"), [arg("reader")]);
}

export function readU8(): TChildren {
  return call(pck("readU8"), [arg("reader")]);
}

export function readU16(): TChildren {
  return call(pck("readU16"), [arg("reader")]);
}

export function readU32(): TChildren {
  return call(pck("readU32"), [arg("reader")]);
}

export function readF32(): TChildren {
  return call(pck("readF32"), [arg("reader")]);
}

export function readF64(): TChildren {
  return call(pck("readF64"), [arg("reader")]);
}

export function readIVar(): TChildren {
  return call(pck("readIVar"), [arg("reader")]);
}

export function readUVar(): TChildren {
  return call(pck("readUVar"), [arg("reader")]);
}

export function readUtf8(): TChildren {
  return call(pck("readUtf8"), [arg("reader")]);
}

export function readFixedUtf8(length: TChildren): TChildren {
  return call(pck("readLongFixedUtf8"), [arg("reader"), length]);
}

export function readAscii(): TChildren {
  return call(pck("readAscii"), [arg("reader")]);
}

export function readLongFixedAscii(length: TChildren): TChildren {
  return call(pck("readLongFixedAscii"), [arg("reader"), length]);
}

export function readBytes(): TChildren {
  return call(pck("readBytes"), [arg("reader")]);
}

export function readFixedBytes(length: TChildren): TChildren {
  return call(pck("readFixedBytes"), [arg("reader"), length]);
}

export function readArray(arrayReader: TChildren): TChildren {
  return call(pck("readArray"), [arg("reader"), arrayReader]);
}

export function readFixedArray(arrayReader: TChildren, size: number): TChildren {
  return call(pck("readFixedArray"), [arg("reader"), arrayReader, size]);
}

export function readRef(value: TChildren): TChildren {
  return call(["unpck", value], [arg("reader")]);
}
