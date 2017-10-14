import { WriteBuffer, ReadBuffer } from "./buffer";
import { readUVar, writeUVar, sizeUVar } from "./number";

const fromCharCode = String.fromCharCode;

const enum C {
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
 * Writes an UTF8 string.
 *
 * @param {!WriteBuffer} b Destination buffer.
 * @param {string} s String.
 */
export function writeFixedUtf8(b: WriteBuffer, s: string): void {
  const u = b.u;
  let offset = b.o;
  for (let i = 0; i < s.length; ++i) {
    let cp = s.charCodeAt(i);
    if (cp < 0x80) {
      u[offset++] = cp;
    } else if (cp < 0x800) {
      u[offset++] = C.t2 | (cp >> 6);
      u[offset++] = C.tx | (cp & C.maskx);
    } else if (cp < 0xD800 || cp >= 0xE000) {
      u[offset++] = C.t3 | (cp >> 12);
      u[offset++] = C.tx | ((cp >> 6) & C.maskx);
      u[offset++] = C.tx | (cp & C.maskx);
    } else {
      cp = (((cp & 0x3FF) << 10) | (s.charCodeAt(++i) & 0x3FF)) + 0x10000;
      u[offset++] = C.t4 | (cp >> 18);
      u[offset++] = C.tx | ((cp >> 12) & C.maskx);
      u[offset++] = C.tx | ((cp >> 6) & C.maskx);
      u[offset++] = C.tx | (cp & C.maskx);
    }
  }
  b.o = offset;
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
    if (c1 < C.tx) {
      codeUnits.push(c1);
    } else if (c1 < C.t3) {
      c2 = u[offset++];
      codeUnits.push(
        ((c1 & C.mask2) << 6) |
        (c2 & C.maskx),
      );
    } else if (c1 < C.t4) {
      c2 = u[offset++];
      c3 = u[offset++];
      codeUnits.push(
        ((c1 & C.mask3) << 12) |
        ((c2 & C.maskx) << 6) |
        (c3 & C.maskx),
      );
    } else if (c1 < C.t5) {
      c2 = u[offset++];
      c3 = u[offset++];
      c4 = u[offset++];
      cp = (
        ((c1 & C.mask4) << 0x12) |
        ((c2 & C.maskx) << 12) |
        ((c3 & C.maskx) << 6) |
        (c4 & C.maskx)
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
 * Writes an ASCII string.
 *
 * @param {!WriteBuffer} b Destination buffer.
 * @param {string} s String.
 */
export function writeFixedAscii(b: WriteBuffer, s: string): void {
  const d = b.u;
  const offset = b.o;
  let i = 0;
  for (; i < s.length; ++i) {
    d[offset + i] = s.charCodeAt(i);
  }
  b.o += i;
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

/**
 * Calculates the size of UTF8 bytes required to store a string.
 *
 * @param {string} s Javascript string.
 * @returns {number} Number of UTF8 bytes required to store a string.
 */
export function sizeUtf8String(s: string): number {
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

export function writeUtf8(b: WriteBuffer, s: string): void {
  writeUVar(b, b.c[b.i++]);
  writeFixedUtf8(b, s);
}

export function readUtf8(b: ReadBuffer): string {
  return readFixedUtf8(b, readUVar(b));
}

export function writeAscii(b: WriteBuffer, s: string): void {
  writeUVar(b, s.length);
  writeFixedAscii(b, s);
}

export function readAscii(b: ReadBuffer): string {
  return readFixedAscii(b, readUVar(b));
}

export function sizeUtf8(b: WriteBuffer, s: string): number {
  const size = sizeUtf8String(s);
  b.c.push(size);
  return sizeUVar(size) + size;
}

export function sizeAscii(s: string): number {
  return sizeUVar(s.length) + s.length;
}
