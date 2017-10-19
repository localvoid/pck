import { Buffer } from "buffer";
import { Writer, WriteNodeFlags, WriteNode, pushWriteNode } from "./writer";
import { ReadBuffer } from "./buffer";
import { readUVar, writeUVar } from "./number";

export function writeFixedBytes(w: Writer, bytes: Buffer, size: number): void {
  pushWriteNode(w, new WriteNode<Buffer>(WriteNodeFlags.Bytes, size, bytes));
}

export function writeBytes(b: Writer, bytes: Buffer): void {
  writeUVar(b, bytes.length);
  writeFixedBytes(b, bytes, bytes.length);
}

export function readFixedBytes(b: ReadBuffer, size: number): Buffer {
  const a = Buffer.allocUnsafe(size);
  const u = b.u;
  let offset = b.o;
  for (let i = 0; i < size; ++i) {
    a[i] = u[offset++];
  }
  b.o = offset;
  return a;
}

export function readBytes(b: ReadBuffer): Buffer {
  return readFixedBytes(b, readUVar(b));
}
