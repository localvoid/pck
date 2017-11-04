import { TChildren } from "osh";
import { intersperse } from "osh-text";
import { line, indent } from "osh-code";
import {
  declInternal, internal, callFunc,
  castToUint8, castToUint16, castToUint32, castToUint64, castToInt16, castToInt32, castToInt64,
} from "./utils";

export function writeUint16Function(): TChildren {
  return [
    line("func ", internal("writeUint16"), "(b []byte, v uint16) {"),
    indent(
      line("_ = b[1]"),
      line("b[0] = byte(v)"),
      line("b[1] = byte(v >> 8)"),
    ),
    line("}"),
  ];
}

export function readUint16Function(): TChildren {
  return [
    line("func ", internal("readUint16"), "(b []byte) uint16 {"),
    indent(
      line("_ = b[1]"),
      line("return uint16(b[0]) | uint16(b[1])<<8"),
    ),
    line("}"),
  ];
}

export function writeUint32Function(): TChildren {
  return [
    line("func ", internal("writeUint32"), "(b []byte, v uint32) {"),
    indent(
      line("_ = b[3]"),
      line("b[0] = byte(v)"),
      line("b[1] = byte(v >> 8)"),
      line("b[2] = byte(v >> 16)"),
      line("b[3] = byte(v >> 24)"),
    ),
    line("}"),
  ];
}

export function readUint32Function(): TChildren {
  return [
    line("func ", internal("readUint32"), "(b []byte) uint32 {"),
    indent(
      line("_ = b[3]"),
      line("return uint32(b[0]) | uint32(b[1])<<8 | uint32(b[2])<<16 | uint32(b[3])<<24"),
    ),
    line("}"),
  ];
}

export function writeUint64Function(): TChildren {
  return [
    line("func ", internal("writeUint64"), "(b []byte, v uint64) {"),
    indent(
      line("_ = b[7]"),
      line("b[0] = byte(v)"),
      line("b[1] = byte(v >> 8)"),
      line("b[2] = byte(v >> 16)"),
      line("b[3] = byte(v >> 24)"),
      line("b[4] = byte(v >> 32)"),
      line("b[5] = byte(v >> 40)"),
      line("b[6] = byte(v >> 48)"),
      line("b[7] = byte(v >> 56)"),
    ),
    line("}"),
  ];
}

export function readUint64Function(): TChildren {
  return [
    line("func ", internal("readUint64"), "(b []byte) uint64 {"),
    indent(
      line("_ = b[7]"),
      line("return uint64(b[0]) | uint64(b[1])<<8 | uint64(b[2])<<16 | uint64(b[3])<<24 |"),
      indent(line("uint64(b[4])<<32 | uint64(b[5])<<40 | uint64(b[6])<<48 | uint64(b[7])<<56")),
    ),
    line("}"),
  ];
}

export function writeUvarFunction(): TChildren {
  return [
    line("func ", internal("writeUvar"), "(b []byte, v uint64) int {"),
    indent(
      line("i := 0"),
      line("for v >= 0x80 {"),
      indent(
        line("b[i] = byte(v) | 0x80"),
        line("v >>= 7"),
        line("i++"),
      ),
      line("}"),
      line("b[i] = byte(v)"),
      line("return i + 1"),
    ),
    line("}"),
  ];
}

export function readUvarFunction(): TChildren {
  return [
    line("func ", internal("readUvar"), "(b []byte) (v uint64, i int) {"),
    indent(
      line("for shift := uint(0); ; shift += 7 {"),
      indent(
        line("x := b[i]"),
        line("i++"),
        line("v |= (uint64(x) & 0x7F) << shift"),
        line("if x < 0x80 {"),
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

export function writeIvarFunction(): TChildren {
  return [
    line("func ", internal("writeIvar"), "(b []byte, v int64) int {"),
    indent(
      line("uv := uint64(v) << 1"),
      line("if v < 0 {"),
      indent(
        line("uv ^= uv"),
      ),
      line("}"),
      line("return ", internal("writeUvar"), "(b, uv)"),
    ),
    line("}"),
  ];
}

export function readIvarFunction(): TChildren {
  return [
    line("func ", internal("readIvar"), "(b []byte) (int64, int) {"),
    indent(
      line("uv, i := ", internal("readUvar"), "(b)"),
      line("v := int64(uv >> 1)"),
      line("if uv&1 != 0 {"),
      indent(
        line("v = ^v"),
      ),
      line("}"),
      line("return v, i"),
    ),
    line("}"),
  ];
}

export function sizeUvarFunction(): TChildren {
  return [
    line("func ", internal("sizeUvar"), "(v uint64) (n int) {"),
    indent(
      line("for {"),
      indent(
        line("n++"),
        line("v >>= 7"),
        line("if v == 0 {"),
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

export function sizeIvarFunction(): TChildren {
  return [
    line("func ", internal("sizeIvar"), "(v int64) int {"),
    indent(
      line("uv := uint64(v) << 1"),
      line("if v < 0 {"),
      indent(
        line("uv ^= uv"),
      ),
      line("}"),
      line("return ", internal("sizeUvar"), "(uv)"),
    ),
    line("}"),
  ];
}

export function lib(): TChildren {
  return intersperse(
    [
      writeUint16Function(),
      readUint16Function(),
      writeUint32Function(),
      readUint32Function(),
      writeUint64Function(),
      readUint64Function(),
      writeUvarFunction(),
      readUvarFunction(),
      writeIvarFunction(),
      readIvarFunction(),
      sizeUvarFunction(),
      sizeIvarFunction(),
    ],
    line(),
  );
}

export function declLibSymbols(...children: TChildren[]): TChildren {
  return declInternal(
    [
      "writeUint16", "writeUint32", "writeUint64",
      "readUint16", "readUint32", "readUint64",
      "writeUvar", "writeIvar",
      "readUvar", "readIvar",
      "sizeUvar", "sizeIvar",
    ],
    children,
  );
}

export function writeUint16(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeUint16"), [buf, castToUint16(value)]);
}

export function writeInt16(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeUint16"), [buf, castToUint16(value)]);
}

export function readUint16(buf: TChildren): TChildren {
  return castToUint16(callFunc(internal("readUint16"), [buf]));
}

export function readInt16(buf: TChildren): TChildren {
  return castToInt16(callFunc(internal("readUint16"), [buf]));
}

export function writeUint32(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeUint32"), [buf, castToUint32(value)]);
}

export function writeInt32(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeUint32"), [buf, castToUint32(value)]);
}

export function readUint32(buf: TChildren): TChildren {
  return castToUint32(callFunc(internal("readUint32"), [buf]));
}

export function readInt32(buf: TChildren): TChildren {
  return castToInt32(callFunc(internal("readUint32"), [buf]));
}

export function writeUint64(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeUint64"), [buf, castToUint64(value)]);
}

export function writeInt64(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeUint64"), [buf, castToUint64(value)]);
}

export function readUint64(buf: TChildren): TChildren {
  return castToUint64(callFunc(internal("readUint64"), [buf]));
}

export function readInt64(buf: TChildren): TChildren {
  return castToInt64(callFunc(internal("readUint64"), [buf]));
}

export function writeUvar(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeUvar"), [buf, castToUint64(value)]);
}

export function writeIvar(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeIvar"), [buf, castToInt64(value)]);
}

export function readUvar(buf: TChildren): TChildren {
  return callFunc(internal("readUvar"), [buf]);
}

export function readIvar(buf: TChildren): TChildren {
  return callFunc(internal("readIvar"), [buf]);
}

export function sizeUvar(...value: TChildren[]): TChildren {
  return callFunc(internal("sizeUvar"), [castToUint64(value)]);
}

export function sizeIvar(...value: TChildren[]): TChildren {
  return callFunc(internal("sizeIvar"), [castToInt64(value)]);
}

export interface InlineReadIntOptions {
  from: (pos: { start?: TChildren, offset: number }) => TChildren;
  to: TChildren;
  start?: TChildren;
  offset?: number;
  cast?: (...c: TChildren[]) => TChildren;
}

export function inlineReadUint8(opts: InlineReadIntOptions): TChildren {
  const offset = opts.offset === void 0 ? 0 : opts.offset;
  const cast = opts.cast === void 0 ? castToUint8 : opts.cast;
  return line(opts.to, " = ", cast(opts.from({ start: opts.start, offset: offset + 0 })));
}

export function inlineReadUint16(opts: InlineReadIntOptions): TChildren {
  const offset = opts.offset === void 0 ? 0 : opts.offset;
  const cast = opts.cast === void 0 ? castToUint16 : opts.cast;
  return (
    line(
      opts.to, " = ",
      cast(
        intersperse(
          [
            [castToUint16(opts.from({ start: opts.start, offset: offset + 0 }))],
            [castToUint16(opts.from({ start: opts.start, offset: offset + 1 })), "<<8"],
          ],
          " | ",
        ),
      ),
    )
  );
}

export function inlineReadUint32(opts: InlineReadIntOptions): TChildren {
  const offset = opts.offset === void 0 ? 0 : opts.offset;
  const cast = opts.cast === void 0 ? castToUint16 : opts.cast;
  return (
    line(
      opts.to, " = ",
      cast(
        intersperse(
          [
            [castToUint32(opts.from({ start: opts.start, offset: offset + 0 }))],
            [castToUint32(opts.from({ start: opts.start, offset: offset + 1 })), "<<8"],
            [castToUint32(opts.from({ start: opts.start, offset: offset + 2 })), "<<16"],
            [castToUint32(opts.from({ start: opts.start, offset: offset + 3 })), "<<24"],
          ],
          " | ",
        ),
      ),
    )
  );
}

export function inlineReadUint64(opts: InlineReadIntOptions): TChildren {
  const offset = opts.offset === void 0 ? 0 : opts.offset;
  const cast = opts.cast === void 0 ? castToUint16 : opts.cast;
  return [
    line(
      opts.to, " = ",
      cast(
        intersperse(
          [
            [castToUint64(opts.from({ start: opts.start, offset: offset + 0 }))],
            [castToUint64(opts.from({ start: opts.start, offset: offset + 1 })), "<<8"],
            [castToUint64(opts.from({ start: opts.start, offset: offset + 2 })), "<<16"],
            [castToUint64(opts.from({ start: opts.start, offset: offset + 3 })), "<<24"],
          ],
          " | ",
        ),
      ),
      " |",
    ),
    line(
      cast(
        intersperse(
          [
            [castToUint64(opts.from({ start: opts.start, offset: offset + 4 })), "<<32"],
            [castToUint64(opts.from({ start: opts.start, offset: offset + 5 })), "<<40"],
            [castToUint64(opts.from({ start: opts.start, offset: offset + 6 })), "<<48"],
            [castToUint64(opts.from({ start: opts.start, offset: offset + 7 })), "<<56"],
          ],
          " | ",
        ),
      ),
    ),
  ];
}
