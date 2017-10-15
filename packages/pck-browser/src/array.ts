import { Writer } from "./writer";
import { ReadBuffer } from "./buffer";
import { writeUVar, readUVar } from "./number";

export function writeArray<T>(w: Writer, array: T[], writer: (w: Writer, v: T) => void): void {
  writeUVar(w, array.length);
  // polymorphic arrays
  // https://v8project.blogspot.ru/2017/09/elements-kinds-in-v8.html
  array.forEach((v) => {
    writer(w, v);
  });
}

export function readArray<T>(b: ReadBuffer, reader: (b: ReadBuffer) => T): T[] {
  const a: T[] = [];
  const length = readUVar(b);
  for (let i = 0; i < length; ++i) {
    a.push(reader(b));
  }
  return a;
}
