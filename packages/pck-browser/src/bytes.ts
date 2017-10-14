import { PckBuffer } from "./buffer";
import { readUVar, writeUVar, sizeUVar } from "./number";

export function writeFixedBytes(b: PckBuffer, bytes: Uint8Array, size: number): void {
  const u = b.u;
  let offset = b.o;
  for (let i = 0; i < size; ++i, ++offset) {
    u[offset] = bytes[i];
  }
  b.o = offset;
}

export function writeBytes(b: PckBuffer, bytes: Uint8Array): void {
  writeUVar(b, bytes.length);
  writeFixedBytes(b, bytes, bytes.length);
}

export function readFixedBytes(b: PckBuffer, size: number): Uint8Array {
  const a = new Uint8Array(size);
  const u = b.u;
  let offset = b.o;
  for (let i = 0; i < size; ++i, ++offset) {
    a[i] = u[offset];
  }
  return a;
}

export function readBytes(b: PckBuffer): Uint8Array {
  return readFixedBytes(b, readUVar(b));
}

export function sizeBytes(bytes: Uint8Array): number {
  return sizeUVar(bytes.length) + bytes.length;
}
