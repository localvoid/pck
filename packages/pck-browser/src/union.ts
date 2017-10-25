import { ReadBuffer } from "./buffer";
import { readUVar } from "./number";

export function readUnion<T>(b: ReadBuffer, taggedReaders: Array<(b: ReadBuffer) => T>): T {
  return taggedReaders[readUVar(b)](b);
}

export function createUnionReader<T>(taggedReaders: Array<(b: ReadBuffer) => T>): (b: ReadBuffer) => T {
  return function (b: ReadBuffer): T {
    return readUnion(b, taggedReaders);
  };
}
