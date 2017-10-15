import { Writer, WriteNode, WriteNodeFlags, pushWriteNode } from "./writer";

export function writeBitSet(w: Writer, ...flags: boolean[]): void;
export function writeBitSet(w: Writer): void {
  let v = 0;
  let j = 0;
  for (let i = 1; i < arguments.length; i++) {
    if (j === 32) {
      pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Int, 4, v));
      v = 0;
      j = 0;
    }
    if (arguments[i] === true) {
      v |= 1 << j;
    }
    ++j;
  }

  if (j > 0) {
    pushWriteNode(w, new WriteNode<number>(WriteNodeFlags.Int, Math.ceil(j / 8), v));
  }
}
