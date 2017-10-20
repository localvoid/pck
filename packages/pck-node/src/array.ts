import { Serializable } from "./interface";
import { Writer } from "./writer";
import { ReadBuffer } from "./buffer";
import { writeUVar, readUVar } from "./number";
import { readOneOf } from "./one_of";

export function writeFixedArray<T>(w: Writer, array: T[], writer: (w: Writer, v: T) => void): void {
  // polymorphic arrays
  // https://v8project.blogspot.ru/2017/09/elements-kinds-in-v8.html
  array.forEach((v) => {
    writer(w, v);
  });
}

export function writeArray<T>(w: Writer, array: T[], writer: (w: Writer, v: T) => void): void {
  writeUVar(w, array.length);
  writeFixedArray(w, array, writer);
}

export function readFixedArray<T>(b: ReadBuffer, reader: (b: ReadBuffer) => T, length: number): T[] {
  const a: T[] = [];
  for (let i = 0; i < length; ++i) {
    a.push(reader(b));
  }
  return a;
}

export function readArray<T>(b: ReadBuffer, reader: (b: ReadBuffer) => T): T[] {
  return readFixedArray(b, reader, readUVar(b));
}

export function writeOneOfArray<T extends Serializable>(w: Writer, array: T[]): void {
  writeUVar(w, array.length);
  for (let i = 0; i < array.length; i++) {
    array[i].pck(w, true);
  }
}

export function readOneOfFixedArray<T>(b: ReadBuffer, readers: Array<(b: ReadBuffer) => T>, length: number): T[] {
  const a: T[] = [];
  for (let i = 0; i < length; ++i) {
    a.push(readOneOf(b, readers));
  }
  return a;
}

export function readOneOfArray<T>(b: ReadBuffer, readers: Array<(b: ReadBuffer) => T>): T[] {
  return readOneOfFixedArray(b, readers, readUVar(b));
}
