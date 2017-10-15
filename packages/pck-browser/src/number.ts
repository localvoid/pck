import { ReadBuffer } from "./buffer";
import { Writer, WriteNode, WriteNodeFlags, pushWriteNode } from "./writer";

const ab = new ArrayBuffer(8);
export const u8 = new Uint8Array(ab);
export const i8 = new Int8Array(ab);
export const u16 = new Uint16Array(ab);
export const i16 = new Int16Array(ab);
export const u32 = new Uint32Array(ab);
export const i32 = new Int32Array(ab);
export const f32 = new Float32Array(ab);
export const f64 = new Float64Array(ab);

export function writeU8(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Int, 1, v));
}

export function writeU16(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Int, 2, v));
}

export function writeU32(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Int, 4, v));
}

export function writeI8(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Int | WriteNodeFlags.Signed, 1, v));
}

export function writeI16(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Int | WriteNodeFlags.Signed, 2, v));
}

export function writeI32(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Int | WriteNodeFlags.Signed, 4, v));
}

export function writeF32(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Float, 4, v));
}

export function writeF64(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Float, 8, v));
}

function sizeUVar(v: number): number {
  if (v <= 0) {
    return 1;
  }
  return Math.floor(Math.log(v) / Math.log(128)) + 1;
}

function sizeIVar(v: number): number {
  return sizeUVar((v << 1) ^ (v >> 31));
}

export function writeUVar(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.VarInt, sizeUVar(v), v));
}

export function writeIVar(w: Writer, v: number): void {
  pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.VarInt | WriteNodeFlags.Signed, sizeIVar(v), v));
}

export function readU8(b: ReadBuffer): number {
  return b.u[b.o++];
}

export function readI8(b: ReadBuffer): number {
  u8[0] = b.u[b.o++];
  return i8[0];
}

export function readU16(b: ReadBuffer): number {
  return b.u[b.o++] | (b.u[b.o++] << 8);
}

export function readI16(b: ReadBuffer): number {
  u8[0] = b.u[b.o++];
  u8[1] = b.u[b.o++];
  return i16[0];
}

export function readU32(b: ReadBuffer): number {
  const u = b.u;
  const offset = b.o;
  b.o += 4;
  return ((u[offset + 3] << 24) >>> 0) + ((u[offset + 2] << 16) | (u[offset + 1] << 8) | (u[offset]));
}

export function readI32(b: ReadBuffer): number {
  const u = b.u;
  let offset = b.o;
  u8[0] = u[offset++];
  u8[1] = u[offset++];
  u8[2] = u[offset++];
  u8[3] = u[offset++];
  b.o = offset;
  return i32[0];
}

export function readF32(b: ReadBuffer): number {
  const u = b.u;
  let offset = b.o;
  u8[0] = u[offset++];
  u8[1] = u[offset++];
  u8[2] = u[offset++];
  u8[3] = u[offset++];
  b.o = offset;
  return f32[0];
}

export function readF64(b: ReadBuffer): number {
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
}

export function readUVar(b: ReadBuffer): number {
  const u = b.u;
  let x = u[b.o++];
  let v = x & 0x7F;
  let shift = 7;
  while ((x & 0x80) !== 0) {
    x = u[b.o++];
    v |= (x & 0x7F) << shift;
    shift += 7;
  }

  return v;
}

export function readIVar(b: ReadBuffer): number {
  const v = readUVar(b);
  return (v >>> 1) ^ -(v & 1);
}
