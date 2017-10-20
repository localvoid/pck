import { utf8Decoder, utf8Encoder } from "pck-browser";

function createString(size: number): string {
  let s = "";
  for (let i = 0; i < size; i++) {
    s += i;
  }
  return s;
}

const STRING_SIZES = [8, 16, 32, 64, 128, 256, 1024, 2048];
const STRINGS = STRING_SIZES.map(createString);
const ENCODED = utf8Encoder === null ? [] : STRINGS.map((s) => utf8Encoder!.encode(s));

const enum Utf8Const {
  tx = 0x80, // 1000 0000
  t2 = 0xC0, // 1100 0000
  t3 = 0xE0, // 1110 0000
  t4 = 0xF0, // 1111 0000
  t5 = 0xF8, // 1111 1000

  maskx = 0x3F, // 0011 1111
  mask2 = 0x1F, // 0001 1111
  mask3 = 0x0F, // 0000 1111
  mask4 = 0x07, // 0000 0111
}

const fromCharCode = String.fromCharCode;

function decodeUtf8(u: Uint8Array, length: number): string {
  let offset = 0;
  const end = offset + length;
  const codeUnits = [];

  let result = "";
  let c1;
  let c2;
  let c3;
  let c4;
  let cp;

  while (offset < end) {
    if (codeUnits.length >= 8192) {
      result += fromCharCode.apply(null, codeUnits);
      codeUnits.length = 0;
    }

    c1 = u[offset++];
    if (c1 < Utf8Const.tx) {
      codeUnits.push(c1);
    } else if (c1 < Utf8Const.t3) {
      c2 = u[offset++];
      codeUnits.push(
        ((c1 & Utf8Const.mask2) << 6) |
        (c2 & Utf8Const.maskx),
      );
    } else if (c1 < Utf8Const.t4) {
      c2 = u[offset++];
      c3 = u[offset++];
      codeUnits.push(
        ((c1 & Utf8Const.mask3) << 12) |
        ((c2 & Utf8Const.maskx) << 6) |
        (c3 & Utf8Const.maskx),
      );
    } else if (c1 < Utf8Const.t5) {
      c2 = u[offset++];
      c3 = u[offset++];
      c4 = u[offset++];
      cp = (
        ((c1 & Utf8Const.mask4) << 0x12) |
        ((c2 & Utf8Const.maskx) << 12) |
        ((c3 & Utf8Const.maskx) << 6) |
        (c4 & Utf8Const.maskx)
      ) - 0x10000;
      codeUnits.push(
        ((cp >> 10) & 0x3FF) + 0xD800,
        (cp & 0x3FF) + 0xDC00,
      );
    }
  }
  result += fromCharCode.apply(null, codeUnits);

  return result;
}

function decodeUtf8WithTextDecoder(u: Uint8Array, length: number): string {
  return utf8Decoder!.decode(u.subarray(0, length));
}

function encodeUtf8(d: Uint8Array, s: string, size: number): void {
  let offset = 0;
  for (let i = 0; i < size; ++i) {
    let cp = s.charCodeAt(i);
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
      cp = (((cp & 0x3FF) << 10) | (s.charCodeAt(++i) & 0x3FF)) + 0x10000;
      d[offset++] = Utf8Const.t4 | (cp >> 18);
      d[offset++] = Utf8Const.tx | ((cp >> 12) & Utf8Const.maskx);
      d[offset++] = Utf8Const.tx | ((cp >> 6) & Utf8Const.maskx);
      d[offset++] = Utf8Const.tx | (cp & Utf8Const.maskx);
    }
  }
}

function encodeUtf8WithTextEncoder(s: string): Uint8Array {
  return utf8Encoder!.encode(s);
}

function sizeUtf8String(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; ++i) {
    const cc = s.charCodeAt(i);
    if (cc < 0x80) {
      n += 1;
    } else if (cc < 0x800) {
      n += 2;
    } else if (cc < 0xD800 || cc >= 0xE000) {
      n += 3;
    } else {
      ++i;
      n += 4;
    }
  }

  return n;
}

export interface Experiment {
  name: string;
  fn: () => any;
}

export const DECODE_STRING_EXPERIMENTS: Experiment[] = [];
export const ENCODE_STRING_EXPERIMENTS: Experiment[] = [];

for (let i = 0; i < ENCODED.length; i++) {
  const b = ENCODED[i];
  const size = STRING_SIZES[i];
  DECODE_STRING_EXPERIMENTS.push(
    {
      name: `decodeUTF8[${size}]`,
      fn: () => decodeUtf8(b, size),
    },
    {
      name: `decodeUTF8WithTextDecoder[${size}]`,
      fn: () => decodeUtf8WithTextDecoder(b, size),
    },
  );
}

for (let i = 0; i < STRINGS.length; i++) {
  const s = STRINGS[i];
  const size = STRING_SIZES[i];
  ENCODE_STRING_EXPERIMENTS.push(
    {
      name: `encodeUTF8[${size}]`,
      fn: () => {
        const nsize = sizeUtf8String(s);
        const a = new Uint8Array(nsize);
        encodeUtf8(a, s, nsize);
        return a;
      },
    },
    {
      name: `encodeUTF8WithTextEncoder[${size}]`,
      fn: () => {
        const t = encodeUtf8WithTextEncoder(s);
        const a = new Uint8Array(t.length);
        a.set(t);
        return a;
      },
    },
    {
      name: `encodeUTF8WithTextEncoderForLoopCopy[${size}]`,
      fn: () => {
        const t = encodeUtf8WithTextEncoder(s);
        const a = new Uint8Array(t.length);
        for (let j = 0; j < t.length; j++) {
          a[j] = t[j];
        }
        return a;
      },
    },
    {
      name: `encodeUTF8CheckSizeWithTextEncoder[${size}]`,
      fn: () => {
        const nsize = sizeUtf8String(s);
        const a = new Uint8Array(nsize);
        const t = encodeUtf8WithTextEncoder(s);
        a.set(t);
        return a;
      },
    },
  );
}
