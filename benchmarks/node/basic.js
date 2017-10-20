"use strict"

const benchmark = require("benchmark");
const pckBrowser = require("pck-browser");
const pckNode = require("pck-node");

const DATA = {
  health: 100,
  jumping: true,
  position: [10, 20],
  attributes: { str: 100, agi: 50, int: 10 },
};

const PCK = pckBrowserEncode();
const JSON_DATA = jsonEncode();

function browserWriteData(w, v) {
  pckBrowser.writeBitSet(w, v.jumping);
  pckBrowser.writeI32(w, v.health);
  pckBrowser.writeFixedArray(w, v.position, pckBrowser.writeI32);
  browserWriteNested(w, v.attributes);
}

function browserWriteNested(w, v) {
  pckBrowser.writeI8(w, v.str);
  pckBrowser.writeI8(w, v.agi);
  pckBrowser.writeI8(w, v.int);
}

function browserReadData(b) {
  const bitSet1 = pckBrowser.readU8(b);
  const jumping = (bitSet1 & 1) !== 0;

  const health = pckBrowser.readI32(b);
  const position = pckBrowser.readFixedArray(b, pckBrowser.readI32, 2);
  const attributes = browserReadNested(b);

  return { health, jumping, position, attributes };
}

function browserReadNested(b) {
  return {
    str: pckBrowser.readU8(b),
    agi: pckBrowser.readU8(b),
    int: pckBrowser.readU8(b),
  };
}

function nodeWriteData(w, v) {
  pckNode.writeBitSet(w, v.jumping);
  pckNode.writeI32(w, v.health);
  pckNode.writeFixedArray(w, v.position, pckBrowser.writeI32);
  nodeWriteNested(w, v.attributes);
}

function nodeWriteNested(w, v) {
  pckNode.writeI8(w, v.str);
  pckNode.writeI8(w, v.agi);
  pckNode.writeI8(w, v.int);
}

function nodeReadData(b) {
  const bitSet1 = pckNode.readU8(b);
  const jumping = (bitSet1 & 1) !== 0;

  const health = pckNode.readI32(b);
  const position = pckNode.readFixedArray(b, pckNode.readI32, 2);
  const attributes = nodeReadNested(b);

  return { health, jumping, position, attributes };
}

function nodeReadNested(b) {
  return {
    str: pckNode.readU8(b),
    agi: pckNode.readU8(b),
    int: pckNode.readU8(b),
  };
}

function pckBrowserEncode() {
  const w = new pckBrowser.Writer();
  browserWriteData(w, DATA);
  const a = new Uint8Array(w.size);
  pckBrowser.serialize(w, a);
  return a;
}

function pckBrowserDecode() {
  return browserReadData({ u: PCK, o: 0 });
}

function pckNodeEncode() {
  const w = new pckNode.Writer();
  nodeWriteData(w, DATA);
  const a = Buffer.allocUnsafe(w.size);
  pckNode.serialize(w, a);
  return a;
}

function pckNodeDecode() {
  return nodeReadData({ u: PCK, o: 0 });
}

function jsonEncode() {
  return JSON.stringify(DATA);
}

function jsonDecode() {
  return JSON.parse(JSON_DATA);
}

new benchmark.Suite()
  .add("pck:browser:encode", () => { pckBrowserEncode(); })
  .add("pck:browser:decode", () => { pckBrowserDecode(); })
  .add("pck:node:encode", () => { pckNodeEncode(); })
  .add("pck:node:decode", () => { pckNodeDecode(); })
  .add("json:encode", () => { jsonEncode(); })
  .add("json:decode", () => { jsonDecode(); })
  .on("cycle", (e) => { console.log(String(e.target)); })
  .run();
