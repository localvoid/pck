import { ReadBuffer } from "./buffer";
import { readUVar } from "./number";

export function readOneOf<T>(b: ReadBuffer, readers: Array<(b: ReadBuffer) => T>): T {
  return readers[readUVar(b)](b);
}
