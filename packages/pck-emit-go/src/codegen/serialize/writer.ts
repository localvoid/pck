import { TChildren } from "osh";
import { line } from "osh-code";
import { v } from "../utils";

function toByte(value: TChildren): TChildren {
  return ["byte(", value, ")"];
}

function buf(index?: TChildren): TChildren {
  if (index === void 0) {
    return v("buf");
  }
  return [v("buf"), "[", index, "]"];
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
  return line(buf(offset), " = ", toByte(value));
}

export function writeU16(value: TChildren, offset = 0): TChildren {
  return [
    line(buf(offset), " = ", toByte(value)),
    line(buf(offset + 1), " = ", toByte([value, " >> 8"])),
  ];
}

export function writeU32(value: TChildren, offset = 0): TChildren {
  return [
    line(buf(offset), " = ", toByte(value)),
    line(buf(offset + 1), " = ", toByte([value, " >> 8"])),
    line(buf(offset + 2), " = ", toByte([value, " >> 16"])),
    line(buf(offset + 3), " = ", toByte([value, " >> 24"])),
  ];
}

export function writeU64(value: TChildren, offset = 0): TChildren {
  return [
    line(buf(offset), " = ", toByte(value)),
    line(buf(offset + 1), " = ", toByte([value, " >> 8"])),
    line(buf(offset + 2), " = ", toByte([value, " >> 16"])),
    line(buf(offset + 3), " = ", toByte([value, " >> 24"])),
    line(buf(offset + 4), " = ", toByte([value, " >> 32"])),
    line(buf(offset + 5), " = ", toByte([value, " >> 40"])),
    line(buf(offset + 6), " = ", toByte([value, " >> 48"])),
    line(buf(offset + 7), " = ", toByte([value, " >> 56"])),
  ];
}
