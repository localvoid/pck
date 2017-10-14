import { WriteBuffer } from "./buffer";

export function writeBitSet(b: WriteBuffer, ...flags: boolean[]): void;
export function writeBitSet(b: WriteBuffer): void {
  const u = b.u;
  let offset = b.o;
  let v = 0;
  let j = 0;
  for (let i = 1; i < arguments.length; i++) {
    if (arguments[i] === true) {
      v |= 1 << j;
    }
    ++j;
    if (j === 8) {
      u[offset++] = v;
      v = 0;
      j = 0;
    }
  }
  if (j > 0) {
    u[offset++] = v;
  }
  b.o = offset;
}
