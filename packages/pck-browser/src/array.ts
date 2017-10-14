import { WriteBuffer, ReadBuffer } from "./buffer";
import { writeUVar, readUVar, sizeUVar } from "./number";

export function writeArray<T>(b: WriteBuffer, array: T[], writer: (b: WriteBuffer, v: T) => void): void {
  writeUVar(b, array.length);
  for (let i = 0; i < array.length; ++i) {
    writer(b, array[i]);
  }
}

export function readArray<T>(b: ReadBuffer, reader: (b: ReadBuffer) => T): T[] {
  const a: T[] = [];
  const length = readUVar(b);
  for (let i = 0; i < length; ++i) {
    a.push(reader(b));
  }
  return a;
}

export function sizeArray<T>(sizeCache: number[], array: T[], getSize: (sizeCache: number[], v: T) => number): number {
  let size = sizeUVar(array.length);
  for (let i = 0; i < array.length; ++i) {
    size += getSize(sizeCache, array[i]);
  }
  return size;
}
