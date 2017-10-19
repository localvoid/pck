import { WriteNodeFlags, Writer, WriteNode } from "./writer";
import { u8, f32, f64 } from "./number";
import { Utf8Const } from "./string";

export function serialize(w: Writer, d: Buffer, offset = 0): void {
  let n: WriteNode | null = w.first.next;
  let i;

  while (n !== null) {
    const flags = n.flags;
    let size = n.size;
    let value = n.value;
    if ((flags & (WriteNodeFlags.Int | WriteNodeFlags.Float | WriteNodeFlags.VarInt)) !== 0) {
      if ((flags & (WriteNodeFlags.Int | WriteNodeFlags.Float)) !== 0) {
        if ((flags & WriteNodeFlags.Int) !== 0) {
          // Int
          do {
            d[offset++] = value;
            value >>>= 8;
          } while (--size > 0);
        } else {
          // Float
          if (size === 8) {
            f64[0] = value;
          } else {
            f32[0] = value;
          }
          for (i = 0; i < size; ++i) {
            d[offset++] = u8[i];
          }
        }
      } else {
        // VarInt
        while (value > 0x7F) {
          d[offset++] = (value & 0x7F) | 0x80;
          value >>= 7;
        }
        d[offset++] = value & 0x7F;
      }
    } else {
      if ((flags & WriteNodeFlags.UTF8) !== 0) {
        // UTF8 String
        if (size > 16) {
          offset += d.write(value, offset);
        } else {
          for (i = 0; i < size; ++i) {
            let cp = value.charCodeAt(i);
            if (cp < 0x80) {
              d[offset++] = cp;
            } else if (cp < 0x800) {
              d[offset++] = Utf8Const.t2 | (cp >> 6);
              d[offset++] = Utf8Const.tx | (cp & Utf8Const.maskx);
            } else if (cp < 0xD800 || cp >= 0xE000) {
              d[offset++] = Utf8Const.t3 | (cp >> 12);
              d[offset++] = Utf8Const.tx | ((cp >> 6) & Utf8Const.maskx);
              d[offset++] = Utf8Const.tx | (cp & Utf8Const.maskx);
            } else {
              cp = (((cp & 0x3FF) << 10) | (value.charCodeAt(++i) & 0x3FF)) + 0x10000;
              d[offset++] = Utf8Const.t4 | (cp >> 18);
              d[offset++] = Utf8Const.tx | ((cp >> 12) & Utf8Const.maskx);
              d[offset++] = Utf8Const.tx | ((cp >> 6) & Utf8Const.maskx);
              d[offset++] = Utf8Const.tx | (cp & Utf8Const.maskx);
            }
          }
        }
      } else {
        // Bytes
        for (i = 0; i < size; ++i) {
          d[offset++] = value[i];
        }
      }
    }
    n = n.next;
  }
}
