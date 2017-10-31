import { TChildren } from "osh";
import { line } from "osh-code";
import { arg } from "../utils";

function castToByte(value: TChildren): TChildren {
  return ["byte(", value, ")"];
}

function buf(index?: TChildren): TChildren {
  if (index === void 0) {
    return arg("buf");
  }
  return [arg("buf"), "[", index, "]"];
}

/**
 * https://golang.org/src/encoding/binary/binary.go
 * https://golang.org/issue/14808
 *
 * @param offset Bound check offset
 */
export function boundCheckHint(offset: number): TChildren {
  return line("_ = ", buf(offset));
}

export function writeU8(value: TChildren, offset = 0): TChildren {
  return line(buf(offset), " = ", castToByte(value));
}

export function writeU16(value: TChildren, offset = 0): TChildren {
  return [
    line(buf(offset), " = ", castToByte(value)),
    line(buf(offset + 1), " = ", castToByte([value, " >> 8"])),
  ];
}

export function writeU32(value: TChildren, offset = 0): TChildren {
  return [
    line(buf(offset), " = ", castToByte(value)),
    line(buf(offset + 1), " = ", castToByte([value, " >> 8"])),
    line(buf(offset + 2), " = ", castToByte([value, " >> 16"])),
    line(buf(offset + 3), " = ", castToByte([value, " >> 24"])),
  ];
}

export function writeU64(value: TChildren, offset = 0): TChildren {
  return [
    line(buf(offset), " = ", castToByte(value)),
    line(buf(offset + 1), " = ", castToByte([value, " >> 8"])),
    line(buf(offset + 2), " = ", castToByte([value, " >> 16"])),
    line(buf(offset + 3), " = ", castToByte([value, " >> 24"])),
    line(buf(offset + 4), " = ", castToByte([value, " >> 32"])),
    line(buf(offset + 5), " = ", castToByte([value, " >> 40"])),
    line(buf(offset + 6), " = ", castToByte([value, " >> 48"])),
    line(buf(offset + 7), " = ", castToByte([value, " >> 56"])),
  ];
}
