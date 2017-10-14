import { Bundle } from "pck";

export type Emitter = (bundle: Bundle) => string;

export function createEmitter(): Emitter {
  return (bundle: Bundle): string => {
    return "";
  };
}

/**
 * size calc:
 *
 *     sizeName(v: Type): number {
 *       let size = (
 *         3 + // Fixed fields size + bitset size
 *         sizeArray(sizeEntry, n.entries)
 *       );
 *       if (v.name !== null) {
 *         size += sizeUtf8(v.name);
 *       }
 *       return size;
 *     }
 *
 * writer:
 *
 *     writeName(b: PckBuffer, v: Type): void {
 *       writeBitSet(b,
 *         v.name !== null,
 *         v.boolProperty === true,
 *       );
 *
 *       if (v.name !== null) {
 *         writeUtf8(b, v.name);
 *       }
 *
 *       writeU16(v.weight);
 *
 *       writeArray(b, writeEntry, v.entries);
 *     }
 *
 * reader:
 *
 *     readName(b: PckBuffer): Type {
 *       const bitSet1 = readU8(b);
 *
 *       // bool(name)
 *       const boolProperty = (bitSet1 & (1 << 1)) !== 0;
 *
 *       // optional(utf8(name))
 *       const name = ((bitSet1 & 1) !== 0) ? readUTF8(u) : null;
 *
 *       // u16(weight)
 *       const weight = readU16(b);
 *
 *       // array(entries)
 *       const entries = readArray(b, readEntry);
 *
 *       return new Type(name, boolProperty, weight, entries);
 *     }
 */
