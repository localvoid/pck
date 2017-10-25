import { TChildren } from "osh";
import { call, v, pck } from "../utils";

export function writeI8(value: TChildren): TChildren {
  return call(pck("writeI8"), [v("writer"), value]);
}

export function writeI16(value: TChildren): TChildren {
  return call(pck("writeI16"), [v("writer"), value]);
}

export function writeI32(value: TChildren): TChildren {
  return call(pck("writeI32"), [v("writer"), value]);
}

export function writeF32(value: TChildren): TChildren {
  return call(pck("writeF32"), [v("writer"), value]);
}

export function writeF64(value: TChildren): TChildren {
  return call(pck("writeF64"), [v("writer"), value]);
}

export function writeIVar(value: TChildren): TChildren {
  return call(pck("writeIVar"), [v("writer"), value]);
}

export function writeUVar(value: TChildren): TChildren {
  return call(pck("writeUVar"), [v("writer"), value]);
}

export function writeUtf8(value: TChildren): TChildren {
  return call(pck("writeUtf8"), [v("writer"), value]);
}

export function writeAscii(value: TChildren): TChildren {
  return call(pck("writeAscii"), [v("writer"), value]);
}

export function writeLongFixedAscii(value: TChildren, length: TChildren): TChildren {
  return call(pck("writeLongFixedAscii"), [v("writer"), value, length]);
}

export function writeBytes(value: TChildren): TChildren {
  return call(pck("writeBytes"), [v("writer"), value]);
}

export function writeFixedBytes(value: TChildren, length: TChildren): TChildren {
  return call(pck("writeFixedBytes"), [v("writer"), value, length]);
}

export function writeArray(value: TChildren, arrayWriter: TChildren): TChildren {
  return call(pck("writeArray"), [v("writer"), value, arrayWriter]);
}

export function writeFixedArray(value: TChildren, arrayWriter: TChildren): TChildren {
  return call(pck("writeFixedArray"), [v("writer"), value, arrayWriter]);
}

export function writeRef(value: TChildren): TChildren {
  return call([value, ".pck"], [v("writer")]);
}
