import { expect } from "iko";
import { readFixedUtf8, writeFixedUtf8 } from "../src/string";

const DATA = [
  // 1-byte
  {
    "codePoint": 0x0000,
    "decoded": "\0",
    "encoded": "\0",
  },
  {
    "codePoint": 0x005C,
    "decoded": "\x5C",
    "encoded": "\x5C",
  },
  {
    "codePoint": 0x007F,
    "decoded": "\x7F",
    "encoded": "\x7F",
  },

  // 2-byte
  {
    "codePoint": 0x0080,
    "decoded": "\x80",
    "encoded": "\xC2\x80",
  },
  {
    "codePoint": 0x05CA,
    "decoded": "\u05CA",
    "encoded": "\xD7\x8A",
  },
  {
    "codePoint": 0x07FF,
    "decoded": "\u07FF",
    "encoded": "\xDF\xBF",
  },

  // 3-byte
  {
    "codePoint": 0x0800,
    "decoded": "\u0800",
    "encoded": "\xE0\xA0\x80",
  },
  {
    "codePoint": 0x2C3C,
    "decoded": "\u2C3C",
    "encoded": "\xE2\xB0\xBC",
  },
  {
    "codePoint": 0xFFFF,
    "decoded": "\uFFFF",
    "encoded": "\xEF\xBF\xBF",
  },

  // 4-byte
  {
    "codePoint": 0x010000,
    "decoded": "\uD800\uDC00",
    "encoded": "\xF0\x90\x80\x80",
  },
  {
    "codePoint": 0x01D306,
    "decoded": "\uD834\uDF06",
    "encoded": "\xF0\x9D\x8C\x86",
  },
  {
    "codePoint": 0x10FFF,
    "decoded": "\uDBFF\uDFFF",
    "encoded": "\xF4\x8F\xBF\xBF",
  },
];

function createUint8Array(s: string): Uint8Array {
  const a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    a[i] = s.charCodeAt(i);
  }
  return a;
}

describe("src/string.ts", () => {
  describe("UTF8", () => {
    describe("decode", () => {
      for (const t of DATA) {
        it(`U+${t.codePoint.toString(16).toUpperCase()}`, () => {
          const a = { u: createUint8Array(t.encoded), o: 0 };
          expect(readFixedUtf8(a, t.encoded.length)).toBe(t.decoded);
        });
      }
    });

    describe("encode", () => {
      for (const t of DATA) {
        it(`U+${t.codePoint.toString(16).toUpperCase()}`, () => {
          const a = { u: new Uint8Array(t.encoded.length), c: [], o: 0, i: 0 };
          writeFixedUtf8(a, t.decoded);
          expect(Array.from(a.u)).toBeEqual(Array.from(createUint8Array(t.encoded)));
        });
      }
    });
  });
});
