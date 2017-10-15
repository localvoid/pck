import { WriteNodeFlags, WriteNode } from "./writer";
import { u8, f32, f64 } from "./number";
import { Utf8Const } from "./string";

export function serialize(d: Uint8Array, first: WriteNode): void {
  let n: WriteNode | null = first;
  let offset = 0;
  let i;

  do {
    const flags = n.flags;
    let size = n.size;
    let value = n.value;
    if ((flags & (WriteNodeFlags.Int | WriteNodeFlags.Float | WriteNodeFlags.VarInt)) !== 0) {
      if ((flags & (WriteNodeFlags.Int | WriteNodeFlags.Float)) !== 0) {
        if ((flags & WriteNodeFlags.Int) !== 0) {
          do {
            d[offset++] = value;
            value >>>= 8;
          } while (--size > 0);
        } else {
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
        if ((flags & WriteNodeFlags.VarInt) !== 0) {
          if ((flags & WriteNodeFlags.Signed) !== 0) {
            value = (value << 1) ^ (value >> 31);
          }
          while (value > 0x7F) {
            d[offset++] = (value & 0x7F) | 0x80;
            value >>= 7;
          }
          d[offset++] = value & 0x7F;
        }
      }
    } else {
      if ((flags & (WriteNodeFlags.UTF8 | WriteNodeFlags.ASCII)) !== 0) {
        if ((flags & WriteNodeFlags.UTF8) !== 0) {
          for (i = 0; i < value.length; ++i) {
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
        } else {
          for (i = 0; i < value.length; ++i) {
            d[offset++] = value.charCodeAt(i);
          }
        }
      } else {
        // bytes
        for (i = 0; i < value.length; ++i) {
          d[offset++] = value[i];
        }
      }
    }
    n = n.next;
  } while (n !== null);
}
