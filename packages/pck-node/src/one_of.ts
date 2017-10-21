import { ReadBuffer } from "./buffer";
import { readUVar } from "./number";

export function readOneOf<T>(b: ReadBuffer, readers: Array<(b: ReadBuffer) => T>): T {
  return readers[readUVar(b)](b);
}

export function createOneOfReader<T>(readers: Array<(b: ReadBuffer) => T>): (b: ReadBuffer) => T {
  return function (b: ReadBuffer): T {
    return readOneOf(b, readers);
  };
}
