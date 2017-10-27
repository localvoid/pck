import { TChildren } from "osh";
import { call, arg, pck } from "../utils";

export function writeI8(value: TChildren): TChildren {
  return call(pck("writeI8"), [arg("writer"), value]);
}

export function writeI16(value: TChildren): TChildren {
  return call(pck("writeI16"), [arg("writer"), value]);
}

export function writeI32(value: TChildren): TChildren {
  return call(pck("writeI32"), [arg("writer"), value]);
}

export function writeF32(value: TChildren): TChildren {
  return call(pck("writeF32"), [arg("writer"), value]);
}

export function writeF64(value: TChildren): TChildren {
  return call(pck("writeF64"), [arg("writer"), value]);
}

export function writeIVar(value: TChildren): TChildren {
  return call(pck("writeIVar"), [arg("writer"), value]);
}

export function writeUVar(value: TChildren): TChildren {
  return call(pck("writeUVar"), [arg("writer"), value]);
}

export function writeUtf8(value: TChildren): TChildren {
  return call(pck("writeUtf8"), [arg("writer"), value]);
}

export function writeAscii(value: TChildren): TChildren {
  return call(pck("writeAscii"), [arg("writer"), value]);
}

export function writeLongFixedAscii(value: TChildren, length: TChildren): TChildren {
  return call(pck("writeLongFixedAscii"), [arg("writer"), value, length]);
}

export function writeBytes(value: TChildren): TChildren {
  return call(pck("writeBytes"), [arg("writer"), value]);
}

export function writeFixedBytes(value: TChildren, length: TChildren): TChildren {
  return call(pck("writeFixedBytes"), [arg("writer"), value, length]);
}

export function writeArray(value: TChildren, arrayWriter: TChildren): TChildren {
  return call(pck("writeArray"), [arg("writer"), value, arrayWriter]);
}

export function writeFixedArray(value: TChildren, arrayWriter: TChildren): TChildren {
  return call(pck("writeFixedArray"), [arg("writer"), value, arrayWriter]);
}

export function writeRef(value: TChildren): TChildren {
  return call([value, ".pck"], [arg("writer")]);
}
