import { TChildren } from "osh";
import { intersperse } from "osh-text";
import { line, indent } from "osh-code";
import {
  declInternal, internal, callFunc, Value,
  castToByte, castToUint8, castToUint16, castToUint32, castToUint64, castToInt16, castToInt32, castToInt64,
} from "./utils";

export function unpckerInterface(): TChildren {
  return [
    line("type unpcker interface {"),
    indent(
      line("Unpck(b []byte) int"),
    ),
    line("}"),
  ];
}

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

export function writeVarUintFunction(): TChildren {
  return [
    line("func ", internal("writeVarUint"), "(b []byte, v uint64) int {"),
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

export function readVarUintFunction(): TChildren {
  return [
    line("func ", internal("readVarUint"), "(b []byte) (v uint64, i int) {"),
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

export function writeVarIntFunction(): TChildren {
  return [
    line("func ", internal("writeVarInt"), "(b []byte, v int64) int {"),
    indent(
      line("uv := uint64(v) << 1"),
      line("if v < 0 {"),
      indent(
        line("uv ^= uv"),
      ),
      line("}"),
      line("return ", internal("writeVarUint"), "(b, uv)"),
    ),
    line("}"),
  ];
}

export function readVarIntFunction(): TChildren {
  return [
    line("func ", internal("readVarInt"), "(b []byte) (int64, int) {"),
    indent(
      line("uv, i := ", internal("readVarUint"), "(b)"),
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

export function sizeVarUintFunction(): TChildren {
  return [
    line("func ", internal("sizeVarUint"), "(v uint64) (n int) {"),
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

export function sizeVarIntFunction(): TChildren {
  return [
    line("func ", internal("sizeVarInt"), "(v int64) int {"),
    indent(
      line("uv := uint64(v) << 1"),
      line("if v < 0 {"),
      indent(
        line("uv ^= uv"),
      ),
      line("}"),
      line("return ", internal("sizeVarUint"), "(uv)"),
    ),
    line("}"),
  ];
}

export function lib(): TChildren {
  return intersperse(
    [
      unpckerInterface(),
      writeUint16Function(),
      readUint16Function(),
      writeUint32Function(),
      readUint32Function(),
      writeUint64Function(),
      readUint64Function(),
      writeVarUintFunction(),
      readVarUintFunction(),
      writeVarIntFunction(),
      readVarIntFunction(),
      sizeVarUintFunction(),
      sizeVarIntFunction(),
    ],
    line(),
  );
}

export function declLibSymbols(...children: TChildren[]): TChildren {
  return declInternal(
    [
      "Pcker",
      "writeUint16", "writeUint32", "writeUint64",
      "readUint16", "readUint32", "readUint64",
      "writeVarUint", "writeVarInt",
      "readVarUint", "readVarInt",
      "sizeVarUint", "sizeVarInt",
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

export function writeVarUint(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeVarUint"), [buf, castToUint64(value)]);
}

export function writeVarInt(buf: TChildren, value: TChildren): TChildren {
  return callFunc(internal("writeVarInt"), [buf, castToInt64(value)]);
}

export function readVarUint(buf: TChildren): TChildren {
  return callFunc(internal("readVarUint"), [buf]);
}

export function readVarInt(buf: TChildren): TChildren {
  return callFunc(internal("readVarInt"), [buf]);
}

export function sizeVarUint(...value: TChildren[]): TChildren {
  return callFunc(internal("sizeVarUint"), [castToUint64(value)]);
}

export function sizeVarInt(...value: TChildren[]): TChildren {
  return callFunc(internal("sizeVarInt"), [castToInt64(value)]);
}

export interface InlineReadIntOptions {
  from: Value;
  to: Value;
  start?: TChildren;
  offset?: number;
  cast?: (...c: TChildren[]) => TChildren;
}

export function inlineReadUint8(opts: InlineReadIntOptions): TChildren {
  const offset = opts.offset === void 0 ? 0 : opts.offset;
  const cast = opts.cast === void 0 ? castToUint8 : opts.cast;
  return line(opts.to.assign(cast(opts.from.at(offset + 0, opts.start))));
}

export function inlineReadUint16(opts: InlineReadIntOptions): TChildren {
  const offset = opts.offset === void 0 ? 0 : opts.offset;
  const cast = opts.cast === void 0 ? castToUint16 : opts.cast;
  return (
    line(
      opts.to.assign(
        cast(
          intersperse(
            [
              [castToUint16(opts.from.at(offset + 0, opts.start))],
              [castToUint16(opts.from.at(offset + 1, opts.start)), "<<8"],
            ],
            " | ",
          ),
        ),
      ),
    )
  );
}

export function inlineReadUint32(opts: InlineReadIntOptions): TChildren {
  const offset = opts.offset === void 0 ? 0 : opts.offset;
  const cast = opts.cast === void 0 ? castToUint32 : opts.cast;
  return (
    line(
      opts.to.assign(
        cast(
          intersperse(
            [
              [castToUint32(opts.from.at(offset + 0, opts.start))],
              [castToUint32(opts.from.at(offset + 1, opts.start)), "<<8"],
              [castToUint32(opts.from.at(offset + 2, opts.start)), "<<16"],
              [castToUint32(opts.from.at(offset + 3, opts.start)), "<<24"],
            ],
            " | ",
          ),
        ),
      ),
    )
  );
}

export function inlineReadUint64(opts: InlineReadIntOptions): TChildren {
  const offset = opts.offset === void 0 ? 0 : opts.offset;
  const cast = opts.cast === void 0 ? castToUint64 : opts.cast;
  return [
    line(
      opts.to.assign(
        cast(
          intersperse(
            [
              [castToUint64(opts.from.at(offset + 0, opts.start))],
              [castToUint64(opts.from.at(offset + 1, opts.start)), "<<8"],
              [castToUint64(opts.from.at(offset + 2, opts.start)), "<<16"],
              [castToUint64(opts.from.at(offset + 3, opts.start)), "<<24"],
            ],
            " | ",
          ),
        ),
      ),
      " |",
    ),
    line(
      cast(
        intersperse(
          [
            [castToUint64(opts.from.at(offset + 4, opts.start)), "<<32"],
            [castToUint64(opts.from.at(offset + 5, opts.start)), "<<40"],
            [castToUint64(opts.from.at(offset + 6, opts.start)), "<<48"],
            [castToUint64(opts.from.at(offset + 7, opts.start)), "<<56"],
          ],
          " | ",
        ),
      ),
    ),
  ];
}

export interface InlineWriteIntOptions {
  from: Value;
  to: Value;
  start?: TChildren;
  offset?: number;
}

export function inlineWriteUint8(opts: InlineWriteIntOptions): TChildren {
  const offset = opts.offset === undefined ? 0 : opts.offset;
  return line(opts.to.assignAt(offset, castToByte(opts.from.value), opts.start));
}

export function inlineWriteUint16(opts: InlineWriteIntOptions): TChildren {
  const offset = opts.offset === undefined ? 0 : opts.offset;
  return [
    line(opts.to.assignAt(offset + 0, castToByte(opts.from.value), opts.start)),
    line(opts.to.assignAt(offset + 1, castToByte(opts.from.value, " >> 8"), opts.start)),
  ];
}

export function inlineWriteUint32(opts: InlineWriteIntOptions): TChildren {
  const offset = opts.offset === undefined ? 0 : opts.offset;
  return [
    line(opts.to.assignAt(offset + 0, castToByte(opts.from.value), opts.start)),
    line(opts.to.assignAt(offset + 1, castToByte(opts.from.value, " >> 8"), opts.start)),
    line(opts.to.assignAt(offset + 2, castToByte(opts.from.value, " >> 16"), opts.start)),
    line(opts.to.assignAt(offset + 3, castToByte(opts.from.value, " >> 24"), opts.start)),
  ];
}

export function inlineWriteUint64(opts: InlineWriteIntOptions): TChildren {
  const offset = opts.offset === undefined ? 0 : opts.offset;
  return [
    line(opts.to.assignAt(offset + 0, castToByte(opts.from.value), opts.start)),
    line(opts.to.assignAt(offset + 1, castToByte(opts.from.value, " >> 8"), opts.start)),
    line(opts.to.assignAt(offset + 2, castToByte(opts.from.value, " >> 16"), opts.start)),
    line(opts.to.assignAt(offset + 3, castToByte(opts.from.value, " >> 24"), opts.start)),
    line(opts.to.assignAt(offset + 4, castToByte(opts.from.value, " >> 32"), opts.start)),
    line(opts.to.assignAt(offset + 5, castToByte(opts.from.value, " >> 40"), opts.start)),
    line(opts.to.assignAt(offset + 6, castToByte(opts.from.value, " >> 48"), opts.start)),
    line(opts.to.assignAt(offset + 7, castToByte(opts.from.value, " >> 56"), opts.start)),
  ];
}
