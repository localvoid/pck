import { Writer, WriteNode, WriteNodeFlags, pushWriteNode } from "./writer";

export function writeBitSet(w: Writer, ...flags: boolean[]): void;
export function writeBitSet(w: Writer): void {
  const l = arguments.length;
  let vs: number[] | undefined;
  let v = 0;
  let j = 0;
  for (let i = 1; i < l; i++) {
    if (j === 32) {
      if (vs === void 0) {
        vs = [v];
      } else {
        vs.push(v);
      }
      v = 0;
      j = 0;
    }
    if (arguments[i] === true) {
      v |= 1 << j;
    }
    ++j;
  }

  let result: number | number[] = v;
  if (vs !== void 0) {
    result = vs;
    if (j > 0) {
      vs.push(v);
    }
  }
  pushWriteNode(w, new WriteNode<number | number[]>(WriteNodeFlags.BitSet, Math.ceil((l - 1) / 8), v));
}
