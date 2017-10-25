import { TChildren } from "osh";
import { call, v, pck } from "../utils";

export function readI8(): TChildren {
  return call(pck("readI8"), [v("reader")]);
}

export function readI16(): TChildren {
  return call(pck("readI16"), [v("reader")]);
}

export function readI32(): TChildren {
  return call(pck("readI32"), [v("reader")]);
}

export function readU8(): TChildren {
  return call(pck("readU8"), [v("reader")]);
}

export function readU16(): TChildren {
  return call(pck("readU16"), [v("reader")]);
}

export function readU32(): TChildren {
  return call(pck("readU32"), [v("reader")]);
}

export function readF32(): TChildren {
  return call(pck("readF32"), [v("reader")]);
}

export function readF64(): TChildren {
  return call(pck("readF64"), [v("reader")]);
}

export function readIVar(): TChildren {
  return call(pck("readIVar"), [v("reader")]);
}

export function readUVar(): TChildren {
  return call(pck("readUVar"), [v("reader")]);
}

export function readUtf8(): TChildren {
  return call(pck("readUtf8"), [v("reader")]);
}

export function readFixedUtf8(length: TChildren): TChildren {
  return call(pck("readLongFixedUtf8"), [v("reader"), length]);
}

export function readAscii(): TChildren {
  return call(pck("readAscii"), [v("reader")]);
}

export function readLongFixedAscii(length: TChildren): TChildren {
  return call(pck("readLongFixedAscii"), [v("reader"), length]);
}

export function readBytes(): TChildren {
  return call(pck("readBytes"), [v("reader")]);
}

export function readFixedBytes(length: TChildren): TChildren {
  return call(pck("readFixedBytes"), [v("reader"), length]);
}

export function readArray(arrayReader: TChildren): TChildren {
  return call(pck("readArray"), [v("reader"), arrayReader]);
}

export function readFixedArray(arrayReader: TChildren, size: number): TChildren {
  return call(pck("readFixedArray"), [v("reader"), arrayReader, size]);
}

export function readRef(value: TChildren): TChildren {
  return call(["unpck", value], [v("reader")]);
}
