
import * as __pck from "pck-browser";

const DATA8 = { "s": "" };
const DATA32 = { "s": "" };
const DATA1k = { "s": "" };
const DATA20k = { "s": "" };

for (let i = 0; i < 8; i++) {
  DATA8["s"] += i;
}
for (let i = 0; i < 32; i++) {
  DATA32["s"] += i;
}
for (let i = 0; i < 1024; i++) {
  DATA1k["s"] += i;
}
for (let i = 0; i < 20 * 1024; i++) {
  DATA20k["s"] += i;
}

const PCK8 = pckEncodeUTF8();
const PCK32 = pckEncodeUTF32();
const PCK1k = pckEncodeUTF1k();
const PCK20k = pckEncodeUTF20k();
const JSON8 = jsonEncodeUTF8();
const JSON32 = jsonEncodeUTF32();
const JSON1k = jsonEncodeUTF1k();
const JSON20k = jsonEncodeUTF20k();

function writeUTF8(w: __pck.Writer, v: any): void {
  __pck.writeUtf8(w, v["s"]);
}

function readUTF8(b: __pck.ReadBuffer): any {
  return {
    "s": __pck.readUtf8(b),
  };
}

function writeASCII(w: __pck.Writer, v: any): void {
  __pck.writeAscii(w, v["s"]);
}

function readASCII(b: __pck.ReadBuffer): any {
  return {
    "s": __pck.readUtf8(b),
  };
}

export function pckEncodeUTF8() {
  const w = new __pck.Writer();
  writeUTF8(w, DATA8);
  const a = new Uint8Array(w.size);
  __pck.serialize(w, a);
  return a;
}

export function pckDecodeUTF8() {
  return readUTF8({ u: PCK8, o: 0 });
}

export function pckEncodeUTF32() {
  const w = new __pck.Writer();
  writeUTF8(w, DATA32);
  const a = new Uint8Array(w.size);
  __pck.serialize(w, a);
  return a;
}

export function pckDecodeUTF32() {
  return readUTF8({ u: PCK32, o: 0 });
}

export function pckEncodeUTF1k() {
  const w = new __pck.Writer();
  writeUTF8(w, DATA1k);
  const a = new Uint8Array(w.size);
  __pck.serialize(w, a);
  return a;
}

export function pckDecodeUTF1k() {
  return readUTF8({ u: PCK1k, o: 0 });
}

export function pckEncodeUTF20k() {
  const w = new __pck.Writer();
  writeUTF8(w, DATA20k);
  const a = new Uint8Array(w.size);
  __pck.serialize(w, a);
  return a;
}

export function pckDecodeUTF20k() {
  return readUTF8({ u: PCK20k, o: 0 });
}

export function pckEncodeASCII8() {
  const w = new __pck.Writer();
  writeASCII(w, DATA8);
  const a = new Uint8Array(w.size);
  __pck.serialize(w, a);
  return a;
}

export function pckDecodeASCII8() {
  return readASCII({ u: PCK8, o: 0 });
}

export function pckEncodeASCII32() {
  const w = new __pck.Writer();
  writeASCII(w, DATA32);
  const a = new Uint8Array(w.size);
  __pck.serialize(w, a);
  return a;
}

export function pckDecodeASCII32() {
  return readASCII({ u: PCK32, o: 0 });
}

export function pckEncodeASCII1k() {
  const w = new __pck.Writer();
  writeASCII(w, DATA1k);
  const a = new Uint8Array(w.size);
  __pck.serialize(w, a);
  return a;
}

export function pckDecodeASCII1k() {
  return readASCII({ u: PCK1k, o: 0 });
}

export function pckEncodeASCII20k() {
  const w = new __pck.Writer();
  writeASCII(w, DATA20k);
  const a = new Uint8Array(w.size);
  __pck.serialize(w, a);
  return a;
}

export function pckDecodeASCII20k() {
  return readASCII({ u: PCK20k, o: 0 });
}

export function jsonEncodeUTF8() {
  return JSON.stringify(DATA8);
}

export function jsonDecodeUTF8() {
  return JSON.parse(JSON8);
}

export function jsonEncodeUTF32() {
  return JSON.stringify(DATA32);
}

export function jsonDecodeUTF32() {
  return JSON.parse(JSON32);
}

export function jsonEncodeUTF1k() {
  return JSON.stringify(DATA1k);
}

export function jsonDecodeUTF1k() {
  return JSON.parse(JSON1k);
}

export function jsonEncodeUTF20k() {
  return JSON.stringify(DATA20k);
}

export function jsonDecodeUTF20k() {
  return JSON.parse(JSON20k);
}
