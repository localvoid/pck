import { TChildren } from "osh";
import { line, indent } from "osh-code";
import { internal } from "./utils";

export function putU8Function(): TChildren {
  return [
    line("func ", internal("putU8"), "(buf []byte, offset int, v uint8) int {"),
    indent(
      line("buf[offset] = uint8(v)"),
      line("return offset + 1"),
    ),
    line("}"),
  ];
}

export function putU16Function(): TChildren {
  return [
    line("func ", internal("putU16"), "(buf []byte, offset int, v uint16) int {"),
    indent(
      line("buf[offset] = uint8(v)"),
      line("buf[offset + 1] = uint8(v >> 8)"),
      line("return offset + 2"),
    ),
    line("}"),
  ];
}

export function putU32Function(): TChildren {
  return [
    line("func ", internal("putU32"), "(buf []byte, offset int, v uint32) int {"),
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

export function putU64Function(): TChildren {
  return [
    line("func ", internal("putU64"), "(buf []byte, offset int, v uint64) int {"),
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

export function putUVarFunction(): TChildren {
  return [
    line("func ", internal("putUVar"), "(buf []byte, offset int, v uint32) int {"),
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

export function sizeUVarFunction(): TChildren {
  return [
    line("func ", internal("sizeUVar"), "(x uint64) (n int) {"),
    indent(
      line("for {"),
      indent(
        line("n++"),
        line("x >>= 7"),
        line("if x == 0 {"),
        indent(
          line("return"),
        ),
        line("}"),
      ),
      line("}"),
    ),
    line("}"),
  ];
}

export function sizeIVarFunction(): TChildren {
  return [
    line("func ", internal("sizeIVar"), "(x uint64) int {"),
    indent(
      line("return sizeUVar(uint64((x << 1) ^ uint64((int64(x) >> 63))))"),
    ),
    line("}"),
  ];
}
