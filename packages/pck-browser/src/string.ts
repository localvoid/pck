import { Writer, WriteNode, WriteNodeFlags, pushWriteNode } from "./writer";
import { ReadBuffer } from "./buffer";
import { readUVar, writeUVar } from "./number";

const fromCharCode = String.fromCharCode;

export const enum Utf8Const {
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

/**
 * Calculates the size of UTF8 bytes required to store a string.
 *
 * @param {string} s Javascript string.
 * @returns {number} Number of UTF8 bytes required to store a string.
 */
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

export function writeFixedUtf8(w: Writer, s: string, size: number): void {
  pushWriteNode(w, new WriteNode<string>(WriteNodeFlags.UTF8, size, s));
}

export function writeFixedAscii(w: Writer, s: string): void {
  pushWriteNode(w, new WriteNode<string>(WriteNodeFlags.UTF8, s.length, s));
}

export function writeUtf8(w: Writer, s: string): void {
  const size = sizeUtf8String(s);
  writeUVar(w, size);
  writeFixedUtf8(w, s, size);
}

export function writeAscii(w: Writer, s: string): void {
  writeUVar(w, s.length);
  writeFixedAscii(w, s);
}

/**
 * Reads an UTF8 string.
 *
 * @param {!ReadBuffer} b Source buffer.
 * @param {number} length UTF8 bytes length.
 * @returns String.
 */
export function readFixedUtf8(b: ReadBuffer, length: number): string {
  const u = b.u;
  let offset = b.o;
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
  b.o = offset;

  return result;
}

/**
 * Reads an ASCII string.
 *
 * @param {!ReadBuffer} b Source buffer.
 * @param {number} length ASCII bytes length.
 * @returns String.
 */
export function readFixedAscii(b: ReadBuffer, length: number): string {
  const u = b.u;
  let offset = b.o;
  const end = offset + length;
  const codeUnits = [];
  let result = "";

  while (offset < end) {
    if (codeUnits.length >= 8192) {
      result += fromCharCode.apply(null, codeUnits);
      codeUnits.length = 0;
    }

    codeUnits.push(u[offset++]);
  }
  result += fromCharCode.apply(null, codeUnits);
  b.o = offset;

  return result;
}

export function readUtf8(b: ReadBuffer): string {
  return readFixedUtf8(b, readUVar(b));
}

export function readAscii(b: ReadBuffer): string {
  return readFixedAscii(b, readUVar(b));
}
