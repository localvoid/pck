import { Writer, WriteNodeFlags, WriteNode, pushWriteNode } from "./writer";
import { ReadBuffer } from "./buffer";
import { readUVar, writeUVar } from "./number";

export function writeFixedBytes(w: Writer, bytes: Uint8Array, size: number): void {
  pushWriteNode(w, new WriteNode<Uint8Array>(WriteNodeFlags.Bytes, size, bytes));
}

export function writeBytes(b: Writer, bytes: Uint8Array): void {
  writeUVar(b, bytes.length);
  writeFixedBytes(b, bytes, bytes.length);
}

export function readFixedBytes(b: ReadBuffer, size: number): Uint8Array {
  const a = new Uint8Array(size);
  const u = b.u;
  let offset = b.o;
  for (let i = 0; i < size; ++i, ++offset) {
    a[i] = u[offset];
  }
  return a;
}

export function readBytes(b: ReadBuffer): Uint8Array {
  return readFixedBytes(b, readUVar(b));
}
