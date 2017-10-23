"use strict"

const benchmark = require("benchmark");
const pckBrowser = require("pck-browser");
const pckNode = require("pck-node");

const DATA = {
  health: 100,
  jumping: true,
  position: { x: 10, y: 20 },
  attributes: { str: 100, agi: 50, int: 10 },
};

const PCK_BROWSER = pckBrowserEncode();
const PCK_NODE = pckBrowserEncode();
const JSON_DATA = jsonEncode();

console.log(`PCK Buffer Size: ${PCK_BROWSER.length}`);
console.log(`JSON Buffer Size: ${JSON_DATA.length}`);

function browserWriteData(w, v) {
  pckBrowser.writeBitSet(w, v.jumping);
  pckBrowser.writeIVar(w, v.health);
  browserWritePosition(w, v.position);
  browserWriteAttributes(w, v.attributes);
}

function browserWritePosition(w, v) {
  pckBrowser.writeIVar(w, v.x);
  pckBrowser.writeIVar(w, v.y);
}

function browserWriteAttributes(w, v) {
  pckBrowser.writeI8(w, v.str);
  pckBrowser.writeI8(w, v.agi);
  pckBrowser.writeI8(w, v.int);
}

function browserReadData(b) {
  const bitSet1 = pckBrowser.readU8(b);
  const jumping = (bitSet1 & 1) !== 0;

  const health = pckBrowser.readIVar(b);
  const position = browserReadPosition(b);
  const attributes = browserReadAttributes(b);

  return { health, jumping, position, attributes };
}

function browserReadPosition(b) {
  return {
    x: pckBrowser.readIVar(b),
    y: pckBrowser.readIVar(b),
  };
}

function browserReadAttributes(b) {
  return {
    str: pckBrowser.readU8(b),
    agi: pckBrowser.readU8(b),
    int: pckBrowser.readU8(b),
  };
}

function nodeWriteData(w, v) {
  pckNode.writeBitSet(w, v.jumping);
  pckNode.writeIVar(w, v.health);
  nodeWritePosition(w, v.position);
  nodeWriteAttributes(w, v.attributes);
}

function nodeWritePosition(w, v) {
  pckNode.writeIVar(w, v.x);
  pckNode.writeIVar(w, v.y);
}

function nodeWriteAttributes(w, v) {
  pckNode.writeI8(w, v.str);
  pckNode.writeI8(w, v.agi);
  pckNode.writeI8(w, v.int);
}

function nodeReadData(b) {
  const bitSet1 = pckNode.readU8(b);
  const jumping = (bitSet1 & 1) !== 0;

  const health = pckNode.readIVar(b);
  const position = nodeReadPosition(b);
  const attributes = nodeReadAttributes(b);

  return { health, jumping, position, attributes };
}

function nodeReadPosition(b) {
  return {
    x: pckNode.readIVar(b),
    y: pckNode.readIVar(b),
  };
}

function nodeReadAttributes(b) {
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
  return browserReadData({ u: PCK_BROWSER, o: 0 });
}

function pckNodeEncode() {
  const w = new pckNode.Writer();
  nodeWriteData(w, DATA);
  const a = Buffer.allocUnsafe(w.size);
  pckNode.serialize(w, a);
  return a;
}

function pckNodeDecode() {
  return nodeReadData({ u: PCK_NODE, o: 0 });
}

function jsonEncode() {
  return Buffer.from(JSON.stringify(DATA));
}

function jsonDecode() {
  return JSON.parse(JSON_DATA.toString());
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
