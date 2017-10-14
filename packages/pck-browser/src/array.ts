import { PckBuffer } from "./buffer";
import { writeUVar, readUVar, sizeUVar } from "./number";

export function writeArray<T>(b: PckBuffer, array: T[], writer: (b: PckBuffer, v: T) => void): void {
  writeUVar(b, array.length);
  for (let i = 0; i < array.length; ++i) {
    writer(b, array[i]);
  }
}

export function readArray<T>(b: PckBuffer, reader: (b: PckBuffer) => T): T[] {
  const a: T[] = [];
  const length = readUVar(b);
  for (let i = 0; i < length; ++i) {
    a.push(reader(b));
  }
  return a;
}

export function sizeArray<T>(array: T[], getSize: (v: T) => number): number {
  let size = sizeUVar(array.length);
  for (let i = 0; i < array.length; ++i) {
    size += getSize(array[i]);
  }
  return size;
}
