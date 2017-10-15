import { expect } from "iko";
import { Writer } from "../src/writer";
import { serialize } from "../src/serializer";
import {
  readU8, readI8, readU16, readI16, readU32, readI32, writeU8, writeI8, writeU16, writeI16, writeU32, writeI32,
  readF32, readF64, writeF32, writeF64,
  readUVar, readIVar, writeUVar, writeIVar,
} from "../src/number";

const ab = new ArrayBuffer(8);
const u8 = new Uint8Array(ab);
const dv = new DataView(ab);

const F32_MIN = 1 / Math.pow(2, 126);
const F32_MAX = (2 - 1 / Math.pow(2, 23)) * Math.pow(2, 127);
const F64_MIN = Number.MIN_VALUE;
const F64_MAX = Number.MAX_VALUE;

const U8_VALUES = [0, 127, 255];
const I8_VALUES = [0, -128, 127];
const U16_VALUES = [0, 65535];
const I16_VALUES = [0, -32768, 32767];
const U32_VALUES = [0, 4294967295];
const I32_VALUES = [0, -2147483648, 2147483647];
const F32_VALUES = [0, F32_MIN, F32_MAX];
const F64_VALUES = [0, F64_MIN, F64_MAX];
const UVAR_VALUES = [0, 127, 128, 16383, 16384, 2097151, 2097152, 268435455];
const IVAR_VALUES = [0, -64, 63, -65, 64, -8192, 8191, -8193, 8192, -1048576, 1048575, -1048577, 1048576, -134217728,
  134217727];
const UVAR_SIZES = [1, 1, 2, 2, 3, 3, 4, 4];
const IVAR_SIZES = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];

describe("src/number.ts", () => {
  describe("fixed integers", () => {
    describe("decode", () => {
      for (const v of U8_VALUES) {
        it(`u8: ${v}`, () => {
          const buf = { u: u8, o: 0 };
          dv.setUint8(0, v);
          expect(readU8(buf)).toBe(v);
          expect(buf.o).toBe(1);
        });
      }

      for (const v of I8_VALUES) {
        it(`i8: ${v}`, () => {
          const buf = { u: u8, o: 0 };
          dv.setInt8(0, v);
          expect(readI8(buf)).toBe(v);
          expect(buf.o).toBe(1);
        });
      }

      for (const v of U16_VALUES) {
        it(`u16: ${v}`, () => {
          const buf = { u: u8, o: 0 };
          dv.setUint16(0, v, true);
          expect(readU16(buf)).toBe(v);
          expect(buf.o).toBe(2);
        });
      }

      for (const v of I16_VALUES) {
        it(`i16: ${v}`, () => {
          const buf = { u: u8, o: 0 };
          dv.setInt16(0, v, true);
          expect(readI16(buf)).toBe(v);
          expect(buf.o).toBe(2);
        });
      }

      for (const v of U32_VALUES) {
        it(`u32: ${v}`, () => {
          const buf = { u: u8, o: 0 };
          dv.setUint32(0, v, true);
          expect(readU32(buf)).toBe(v);
          expect(buf.o).toBe(4);
        });
      }

      for (const v of I32_VALUES) {
        it(`i32: ${v}`, () => {
          const buf = { u: u8, o: 0 };
          dv.setInt32(0, v, true);
          expect(readI32(buf)).toBe(v);
          expect(buf.o).toBe(4);
        });
      }

      for (const v of F32_VALUES) {
        it(`f32: ${v}`, () => {
          const buf = { u: u8, o: 0 };
          dv.setFloat32(0, v, true);
          expect(readF32(buf)).toBe(v);
          expect(buf.o).toBe(4);
        });
      }

      for (const v of F64_VALUES) {
        it(`f64: ${v}`, () => {
          const buf = { u: u8, o: 0 };
          dv.setFloat64(0, v, true);
          expect(readF64(buf)).toBe(v);
          expect(buf.o).toBe(8);
        });
      }
    });

    describe("encode", () => {
      for (const v of U8_VALUES) {
        it(`u8: ${v}`, () => {
          const w = new Writer();
          writeU8(w, v);
          expect(w.size).toBe(1);
          serialize(u8, w.first.next!);
          expect(dv.getUint8(0)).toBe(v);
        });
      }

      for (const v of I8_VALUES) {
        it(`i8: ${v}`, () => {
          const w = new Writer();
          writeI8(w, v);
          expect(w.size).toBe(1);
          serialize(u8, w.first.next!);
          expect(dv.getInt8(0)).toBe(v);
        });
      }

      for (const v of U8_VALUES) {
        it(`u16: ${v}`, () => {
          const w = new Writer();
          writeU16(w, v);
          expect(w.size).toBe(2);
          serialize(u8, w.first.next!);
          expect(dv.getUint16(0, true)).toBe(v);
        });
      }

      for (const v of U8_VALUES) {
        it(`i16: ${v}`, () => {
          const w = new Writer();
          writeI16(w, v);
          expect(w.size).toBe(2);
          serialize(u8, w.first.next!);
          expect(dv.getInt16(0, true)).toBe(v);
        });
      }

      for (const v of U8_VALUES) {
        it(`u32: ${v}`, () => {
          const w = new Writer();
          writeU32(w, v);
          expect(w.size).toBe(4);
          serialize(u8, w.first.next!);
          expect(dv.getUint32(0, true)).toBe(v);
        });
      }

      for (const v of I32_VALUES) {
        it(`i32: ${v}`, () => {
          const w = new Writer();
          writeI32(w, v);
          expect(w.size).toBe(4);
          serialize(u8, w.first.next!);
          expect(dv.getInt32(0, true)).toBe(v);
        });
      }

      for (const v of F32_VALUES) {
        it(`f32: ${v}`, () => {
          const w = new Writer();
          writeF32(w, v);
          expect(w.size).toBe(4);
          serialize(u8, w.first.next!);
          expect(dv.getFloat32(0, true)).toBe(v);
        });
      }

      for (const v of F64_VALUES) {
        it(`f64: ${v}`, () => {
          const w = new Writer();
          writeF64(w, v);
          expect(w.size).toBe(8);
          serialize(u8, w.first.next!);
          expect(dv.getFloat64(0, true)).toBe(v);
        });
      }
    });
  });

  describe("variadic integers", () => {
    describe("encode/decode", () => {
      for (let i = 0; i < UVAR_VALUES.length; i++) {
        const v = UVAR_VALUES[i];
        const s = UVAR_SIZES[i];
        it(`uvar: ${v}`, () => {
          const w = new Writer();
          writeUVar(w, v);
          expect(w.size).toBe(s);
          serialize(u8, w.first.next!);
          const buf = { u: u8, o: 0 };
          expect(readUVar(buf)).toBe(v);
        });
      }

      for (let i = 0; i < IVAR_VALUES.length; i++) {
        const v = IVAR_VALUES[i];
        const s = IVAR_SIZES[i];
        it(`ivar: ${v}`, () => {
          const w = new Writer();
          writeIVar(w, v);
          expect(w.size).toBe(s);
          serialize(u8, w.first.next!);
          const buf = { u: u8, o: 0 };
          expect(readIVar(buf)).toBe(v);
        });
      }
    });
  });
});
