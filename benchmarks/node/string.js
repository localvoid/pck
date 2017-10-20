"use strict"

const benchmark = require("benchmark");
const __pck = require("pck-node");

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

function writeUTF8(w, v) {
  __pck.writeUtf8(w, v["s"]);
}

function readUTF8(b) {
  return {
    "s": __pck.readUtf8(b),
  };
}

function writeASCII(w, v) {
  __pck.writeAscii(w, v["s"]);
}

function readASCII(b) {
  return {
    "s": __pck.readUtf8(b),
  };
}

function pckEncodeUTF8() {
  const w = new __pck.Writer();
  writeUTF8(w, DATA8);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecodeUTF8() {
  return readUTF8({ u: PCK8, o: 0 });
}

function pckEncodeUTF32() {
  const w = new __pck.Writer();
  writeUTF8(w, DATA32);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecodeUTF32() {
  return readUTF8({ u: PCK32, o: 0 });
}

function pckEncodeUTF1k() {
  const w = new __pck.Writer();
  writeUTF8(w, DATA1k);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecodeUTF1k() {
  return readUTF8({ u: PCK1k, o: 0 });
}

function pckEncodeUTF20k() {
  const w = new __pck.Writer();
  writeUTF8(w, DATA20k);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecodeUTF20k() {
  return readUTF8({ u: PCK20k, o: 0 });
}

function pckEncodeASCII8() {
  const w = new __pck.Writer();
  writeASCII(w, DATA8);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecodeASCII8() {
  return readASCII({ u: PCK8, o: 0 });
}

function pckEncodeASCII32() {
  const w = new __pck.Writer();
  writeASCII(w, DATA32);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecodeASCII32() {
  return readASCII({ u: PCK32, o: 0 });
}

function pckEncodeASCII1k() {
  const w = new __pck.Writer();
  writeASCII(w, DATA1k);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecodeASCII1k() {
  return readASCII({ u: PCK1k, o: 0 });
}

function pckEncodeASCII20k() {
  const w = new __pck.Writer();
  writeASCII(w, DATA20k);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecodeASCII20k() {
  return readASCII({ u: PCK20k, o: 0 });
}

function jsonEncodeUTF8() {
  return JSON.stringify(DATA8);
}

function jsonDecodeUTF8() {
  return JSON.parse(JSON8);
}

function jsonEncodeUTF32() {
  return JSON.stringify(DATA32);
}

function jsonDecodeUTF32() {
  return JSON.parse(JSON32);
}

function jsonEncodeUTF1k() {
  return JSON.stringify(DATA1k);
}

function jsonDecodeUTF1k() {
  return JSON.parse(JSON1k);
}

function jsonEncodeUTF20k() {
  return JSON.stringify(DATA20k);
}

function jsonDecodeUTF20k() {
  return JSON.parse(JSON20k);
}

const suite = new benchmark.Suite();

function bench(names, fns) {
  for (let i = 0; i < names.length; i++) {
    suite.add(names[i], fns[i]);
  }
}

function add(name, names, fns) {
  bench(names.map((n) => `${name}:${n}`), fns);
}

add("encodeUTF20k", ["PCK", "JSON"], [pckEncodeUTF20k, jsonEncodeUTF20k]);
add("encodeUTF1k", ["PCK", "JSON"], [pckEncodeUTF1k, jsonEncodeUTF1k]);
add("encodeUTF32", ["PCK", "JSON"], [pckEncodeUTF32, jsonEncodeUTF32]);
add("encodeUTF8", ["PCK", "JSON"], [pckEncodeUTF8, jsonEncodeUTF8]);
add("encodeASCII20k", ["PCK", "JSON"], [pckEncodeASCII20k, jsonEncodeUTF20k]);
add("encodeASCII1k", ["PCK", "JSON"], [pckEncodeASCII1k, jsonEncodeUTF1k]);
add("encodeASCII32", ["PCK", "JSON"], [pckEncodeASCII32, jsonEncodeUTF32]);
add("encodeASCII8", ["PCK", "JSON"], [pckEncodeASCII8, jsonEncodeUTF8]);
add("decodeUTF20k", ["PCK", "JSON"], [pckDecodeUTF20k, jsonDecodeUTF20k]);
add("decodeUTF1k", ["PCK", "JSON"], [pckDecodeUTF1k, jsonDecodeUTF1k]);
add("decodeUTF32", ["PCK", "JSON"], [pckDecodeUTF32, jsonDecodeUTF32]);
add("decodeUTF8", ["PCK", "JSON"], [pckDecodeUTF8, jsonDecodeUTF8]);
add("decodeASCII20k", ["PCK", "JSON"], [pckDecodeASCII20k, jsonDecodeUTF20k]);
add("decodeASCII1k", ["PCK", "JSON"], [pckDecodeASCII1k, jsonDecodeUTF1k]);
add("decodeASCII32", ["PCK", "JSON"], [pckDecodeASCII32, jsonDecodeUTF32]);
add("decodeASCII8", ["PCK", "JSON"], [pckDecodeASCII8, jsonDecodeUTF8]);

suite
  .on("cycle", (e) => { console.log(String(e.target)); })
  .run();
