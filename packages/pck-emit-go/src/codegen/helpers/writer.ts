import { TChildren } from "osh";
import { line, indent } from "osh-code";

export function writeU8(): TChildren {
  return [
    line("putU8(buf []byte, offset int, v uint8) int {"),
    indent(
      line("buf[offset] = uint8(v)"),
      line("return offset + 1"),
    ),
    line("}"),
  ];
}

export function writeU16(): TChildren {
  return [
    line("putU16(buf []byte, offset int, v uint16) int {"),
    indent(
      line("buf[offset] = uint8(v)"),
      line("buf[offset + 1] = uint8(v >> 8)"),
      line("return offset + 2"),
    ),
    line("}"),
  ];
}

export function writeU32(): TChildren {
  return [
    line("putU32(buf []byte, offset int, v uint32) int {"),
    indent(
      line("buf[offset] = uint8(v)"),
      line("buf[offset + 1] = uint8(v >> 8)"),
      line("buf[offset + 2] = uint8(v >> 16)"),
      line("buf[offset + 3] = uint8(v >> 24)"),
      line("return offset + 4"),
    ),
    line("}"),
  ];
}

export function writeU64(): TChildren {
  return [
    line("putU64(buf []byte, offset int, v uint64) int {"),
    indent(
      line("buf[offset] = uint8(v)"),
      line("buf[offset + 1] = uint8(v >> 8)"),
      line("buf[offset + 2] = uint8(v >> 16)"),
      line("buf[offset + 3] = uint8(v >> 24)"),
      line("buf[offset + 4] = uint8(v >> 32)"),
      line("buf[offset + 5] = uint8(v >> 40)"),
      line("buf[offset + 6] = uint8(v >> 48)"),
      line("buf[offset + 7] = uint8(v >> 56)"),
      line("return offset + 8"),
    ),
    line("}"),
  ];
}

export function writeUVar(): TChildren {
  return [
    line("putUVar(buf []byte, offset int, v uint32) int {"),
    indent(
      line("for v >= 1<<7 {"),
      indent(
        line("buf[offset] = uint8((v & 0x7f) | 0x80)"),
        line("v >>= 7"),
        line("offset++"),
      ),
      line("}"),
      line("buf[offset] = uint8(v)"),
      line("return offset + 1"),
    ),
    line("}"),
  ];
}
