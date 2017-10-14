import { WriteBuffer, ReadBuffer } from "./buffer";

const ab = new ArrayBuffer(8);
const u8 = new Uint8Array(ab);
const i8 = new Int8Array(ab);
// const u16 = new Uint16Array(ab);
const i16 = new Int16Array(ab);
// const u32 = new Uint32Array(ab);
const i32 = new Int32Array(ab);
const f32 = new Float32Array(ab);
const f64 = new Float64Array(ab);

i32[0] = 1;
const LITTLE_ENDIAN_PLATFORM = !!u8[0];

export function writeU8(b: WriteBuffer, v: number): void {
  b.u[b.o++] = v;
}

export function writeU16(b: WriteBuffer, v: number): void {
  b.u[b.o++] = v;
  b.u[b.o++] = v >>> 8;
}

export function writeU32(b: WriteBuffer, v: number): void {
  const u = b.u;
  let offset = b.o;
  u[offset++] = v;
  u[offset++] = v >>> 8;
  u[offset++] = v >>> 16;
  u[offset++] = v >>> 24;
  b.o = offset;
}

export const writeI8 = writeU8;
export const writeI16 = writeU16;
export const writeI32 = writeU32;

export const writeF32 = LITTLE_ENDIAN_PLATFORM ?
  function (b: WriteBuffer, v: number): void {
    const u = b.u;
    let offset = b.o;
    f32[0] = v;
    u[offset++] = u8[0];
    u[offset++] = u8[1];
    u[offset++] = u8[2];
    u[offset++] = u8[3];
    b.o = offset;
  } :
  function (b: WriteBuffer, v: number): void {
    const d = b.u;
    let offset = b.o;
    f32[0] = v;
    d[offset++] = u8[3];
    d[offset++] = u8[2];
    d[offset++] = u8[1];
    d[offset++] = u8[0];
    b.o = offset;
  };

export const writeF64 = LITTLE_ENDIAN_PLATFORM ?
  function (b: WriteBuffer, v: number): void {
    const u = b.u;
    let offset = b.o;
    f64[0] = v;
    u[offset++] = u8[0];
    u[offset++] = u8[1];
    u[offset++] = u8[2];
    u[offset++] = u8[3];
    u[offset++] = u8[4];
    u[offset++] = u8[5];
    u[offset++] = u8[6];
    u[offset++] = u8[7];
    b.o = offset;
  } :
  function (b: WriteBuffer, v: number): void {
    const u = b.u;
    let offset = b.o;
    f64[0] = v;
    u[offset++] = u8[7];
    u[offset++] = u8[6];
    u[offset++] = u8[5];
    u[offset++] = u8[4];
    u[offset++] = u8[3];
    u[offset++] = u8[2];
    u[offset++] = u8[1];
    u[offset++] = u8[0];
    b.o = offset;
  };

export function readU8(b: ReadBuffer): number {
  return b.u[b.o++];
}

export function readI8(b: ReadBuffer): number {
  u8[0] = b.u[b.o++];
  return i8[0];
}

export const readU16 = LITTLE_ENDIAN_PLATFORM ?
  function (b: ReadBuffer): number {
    return b.u[b.o++] | (b.u[b.o++] << 8);
  } :
  function (b: ReadBuffer): number {
    return (b.u[b.o++] << 8) | b.u[b.o++];
  };

export const readI16 = LITTLE_ENDIAN_PLATFORM ?
  function (b: ReadBuffer): number {
    u8[0] = b.u[b.o++];
    u8[1] = b.u[b.o++];
    return i16[0];
  } :
  function (b: ReadBuffer): number {
    u8[1] = b.u[b.o++];
    u8[0] = b.u[b.o++];
    return i16[0];
  };

export const readU32 = LITTLE_ENDIAN_PLATFORM ?
  function (b: ReadBuffer): number {
    const u = b.u;
    const offset = b.o;
    b.o += 4;
    return ((u[offset + 3] << 24) >>> 0) + ((u[offset + 2] << 16) | (u[offset + 1] << 8) | (u[offset]));
  } :
  function (b: ReadBuffer): number {
    const u = b.u;
    const offset = b.o;
    b.o += 4;
    return ((u[offset] << 24) >>> 0) + ((u[offset + 1] << 16) | (u[offset + 2] << 8) | (u[offset + 3]));
  };

export const readI32 = LITTLE_ENDIAN_PLATFORM ?
  function (b: ReadBuffer): number {
    const u = b.u;
    let offset = b.o;
    u8[0] = u[offset++];
    u8[1] = u[offset++];
    u8[2] = u[offset++];
    u8[3] = u[offset++];
    b.o = offset;
    return i32[0];
  } :
  function (b: ReadBuffer): number {
    const u = b.u;
    let offset = b.o;
    u8[3] = u[offset++];
    u8[2] = u[offset++];
    u8[1] = u[offset++];
    u8[0] = u[offset++];
    b.o = offset;
    return i32[0];
  };

export const readF32 = LITTLE_ENDIAN_PLATFORM ?
  function (b: ReadBuffer): number {
    const u = b.u;
    let offset = b.o;
    u8[0] = u[offset++];
    u8[1] = u[offset++];
    u8[2] = u[offset++];
    u8[3] = u[offset++];
    b.o = offset;
    return f32[0];
  } :
  function (b: ReadBuffer): number {
    const u = b.u;
    let offset = b.o;
    u8[3] = u[offset++];
    u8[2] = u[offset++];
    u8[1] = u[offset++];
    u8[0] = u[offset++];
    b.o = offset;
    return f32[0];
  };

export const readF64 = LITTLE_ENDIAN_PLATFORM ?
  function (b: ReadBuffer): number {
    const u = b.u;
    let offset = b.o;
    u8[0] = u[offset++];
    u8[1] = u[offset++];
    u8[2] = u[offset++];
    u8[3] = u[offset++];
    u8[4] = u[offset++];
    u8[5] = u[offset++];
    u8[6] = u[offset++];
    u8[7] = u[offset++];
    b.o = offset;
    return f64[0];
  } :
  function (b: ReadBuffer): number {
    const u = b.u;
    let offset = b.o;
    u8[7] = u[offset++];
    u8[6] = u[offset++];
    u8[5] = u[offset++];
    u8[4] = u[offset++];
    u8[3] = u[offset++];
    u8[2] = u[offset++];
    u8[1] = u[offset++];
    u8[0] = u[offset++];
    b.o += offset;
    return f64[0];
  };

export function writeUVar(b: WriteBuffer, v: number): void {
  while (v > 0x7F) {
    b.u[b.o++] = (v & 0x7F) | 0x80;
    v >>= 7;
  }
  b.u[b.o++] = v & 0x7F;
}

export function writeIVar(b: WriteBuffer, v: number): void {
  writeUVar(b, (v << 1) ^ (v >> 31));
}

export function readUVar(b: ReadBuffer): number {
  const u = b.u;
  let x = u[b.o++];
  let v = x & 0x7F;
  if ((x & 0x80) !== 0) {
    x = u[b.o++];
    v |= (x & 0x7F) << 7;
    if ((x & 0x80) !== 0) {
      x = u[b.o++];
      v |= (x & 0x7F) << 14;
      if ((x & 0x80) !== 0) {
        x = u[b.o++];
        v |= (x & 0x7F) << 21;
      }
    }
  }

  return v;
}

export function readIVar(b: ReadBuffer): number {
  const v = readUVar(b);
  return (v >>> 1) ^ -(v & 1);
}

export function sizeUVar(v: number): number {
  if (v <= 0) {
    return 1;
  }
  return Math.floor(Math.log(v) / Math.log(128)) + 1;
}

export function sizeIVar(v: number): number {
  return sizeUVar((v << 1) ^ (v >> 31));
}
