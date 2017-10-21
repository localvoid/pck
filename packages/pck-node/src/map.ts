import { Writer } from "./writer";
import { ReadBuffer } from "./buffer";
import { writeUVar, readUVar } from "./number";

export function writeMap<K, V>(
  w: Writer,
  map: Map<K, V>,
  keyWriter: (w: Writer, k: K) => void,
  valueWriter: (w: Writer, v: V) => void,
): void {
  writeUVar(w, map.size);
  map.forEach((v, k) => {
    keyWriter(w, k);
    valueWriter(w, v);
  });
}

export function readMap<K, V>(
  b: ReadBuffer,
  keyReader: (b: ReadBuffer) => K,
  valueReader: (b: ReadBuffer) => V,
): Map<K, V> {
  const map = new Map<K, V>();
  const size = readUVar(b);
  for (let i = 0; i < size; ++i) {
    map.set(keyReader(b), valueReader(b));
  }
  return map;
}
