"use strict"

const benchmark = require("benchmark");
const StringDecoder = require("string_decoder").StringDecoder;

const utf8Decoder = new StringDecoder("utf8");

function createString(size) {
  let s = "";
  for (let i = 0; i < size; i++) {
    s += i;
  }
  return s;
}

const STRING_SIZES = [8, 16, 32, 64, 128, 256, 1024, 2048];
const STRINGS = STRING_SIZES.map(createString);
const ENCODED = STRINGS.map((s) => Buffer.from(s));

const fromCharCode = String.fromCharCode;

function decodeUtf8(u, length) {
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
    if (c1 < 0x80) {
      codeUnits.push(c1);
    } else if (c1 < 0xE0) {
      c2 = u[offset++];
      codeUnits.push(
        ((c1 & 0x1F) << 6) |
        (c2 & 0x3F),
      );
    } else if (c1 < 0xF0) {
      c2 = u[offset++];
      c3 = u[offset++];
      codeUnits.push(
        ((c1 & 0x0F) << 12) |
        ((c2 & 0x3F) << 6) |
        (c3 & 0x3F),
      );
    } else if (c1 < 0xF8) {
      c2 = u[offset++];
      c3 = u[offset++];
      c4 = u[offset++];
      cp = (
        ((c1 & 0x07) << 0x12) |
        ((c2 & 0x3F) << 12) |
        ((c3 & 0x3F) << 6) |
        (c4 & 0x3F)
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

function decodeUtf8WithTextDecoder(u, length) {
  return utf8Decoder.end(Buffer.from(u, 0, length));
}

function encodeUtf8(d, s, size) {
  let offset = 0;
  for (let i = 0; i < size; ++i) {
    let cp = s.charCodeAt(i);
    if (cp < 0x80) {
      d[offset++] = cp;
    } else if (cp < 0x800) {
      d[offset++] = 0xC0 | (cp >> 6);
      d[offset++] = 0x80 | (cp & 0x3F);
    } else if (cp < 0xD800 || cp >= 0xE000) {
      d[offset++] = 0xE0 | (cp >> 12);
      d[offset++] = 0x80 | ((cp >> 6) & 0x3F);
      d[offset++] = 0x80 | (cp & 0x3F);
    } else {
      cp = (((cp & 0x3FF) << 10) | (s.charCodeAt(++i) & 0x3FF)) + 0x10000;
      d[offset++] = 0xF0 | (cp >> 18);
      d[offset++] = 0x80 | ((cp >> 12) & 0x3F);
      d[offset++] = 0x80 | ((cp >> 6) & 0x3F);
      d[offset++] = 0x80 | (cp & 0x3F);
    }
  }
}

function encodeUtf8WithTextEncoder(s) {
  return Buffer.from(s);
}

function sizeUtf8String(s) {
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

const DECODE_STRING_EXPERIMENTS = [];
const ENCODE_STRING_EXPERIMENTS = [];

for (let i = 0; i < ENCODED.length; i++) {
  const b = ENCODED[i];
  const size = STRING_SIZES[i];
  DECODE_STRING_EXPERIMENTS.push(
    {
      name: `decode:UTF8[${size}]`,
      fn: () => decodeUtf8(b, size),
    },
    {
      name: `decode:UTF8:TextDecoder[${size}]`,
      fn: () => decodeUtf8WithTextDecoder(b, size),
    },
  );
}

for (let i = 0; i < STRINGS.length; i++) {
  const s = STRINGS[i];
  const size = STRING_SIZES[i];
  ENCODE_STRING_EXPERIMENTS.push(
    {
      name: `encode:UTF8[${size}]`,
      fn: () => {
        const nsize = sizeUtf8String(s);
        const a = Buffer.allocUnsafe(nsize);
        encodeUtf8(a, s, nsize);
        return a;
      },
    },
    {
      name: `encode:UTF8:write[${size}]`,
      fn: () => {
        const a = Buffer.allocUnsafe(s.length);
        a.write(s);
        return a;
      },
    },
    {
      name: `encode:UTF8:TextEncoder[${size}]`,
      fn: () => {
        const t = encodeUtf8WithTextEncoder(s);
        const a = Buffer.allocUnsafe(t.length);
        t.copy(a, 0);
        return a;
      },
    },
    {
      name: `encode:UTF8:TextEncoder:ForCopy[${size}]`,
      fn: () => {
        const t = encodeUtf8WithTextEncoder(s);
        const a = Buffer.allocUnsafe(t.length);
        for (let j = 0; j < t.length; j++) {
          a[j] = t[j];
        }
        return a;
      },
    },
    {
      name: `encode:UTF8:CheckSize/Write[${size}]`,
      fn: () => {
        const nsize = sizeUtf8String(s);
        const a = Buffer.allocUnsafe(nsize);
        a.write(s);
        return a;
      },
    },
  );
}

const suite = new benchmark.Suite()
  .on("cycle", (e) => { console.log(String(e.target)); });

for (const x of DECODE_STRING_EXPERIMENTS) {
  suite.add(x.name, x.fn);
}

for (const x of ENCODE_STRING_EXPERIMENTS) {
  suite.add(x.name, x.fn);
}

suite.run();
