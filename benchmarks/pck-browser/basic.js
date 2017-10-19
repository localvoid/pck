"use strict"

const benchmark = require("benchmark");
const pckBrowser = require("pck-browser");
const pckNode = require("pck-node");

const DATA = {
  health: 100,
  jumping: true,
  position: [10, 20],
  attributes: {
    str: 100,
    agi: 50,
    int: 10,
  },
};

const PCK_BROWSER_DATA = encodePckBrowser();
const PCK_NODE_DATA = encodePckNode();
const JSON_DATA = JSON.stringify(DATA);

function writeBrowserData(w, v) {
  pckBrowser.writeBitSet(w,
    w.jumping,
  );

  pckBrowser.writeI32(w, v.health);
  pckBrowser.writeArray(w, v.position, pckBrowser.writeI32);
  writeBrowserNested(w, v.attributes);
}

function writeBrowserNested(w, v) {
  pckBrowser.writeI32(w, v.str);
  pckBrowser.writeI32(w, v.agi);
  pckBrowser.writeI32(w, v.int);
}

function readBrowserData(b) {
  const bitSet1 = pckBrowser.readU8(b);
  const jumping = (bitSet1 & 1) !== 0;

  const health = pckBrowser.readI32(b);
  const position = pckBrowser.readArray(b, pckBrowser.readI32);
  const attributes = readBrowserNested(b);

  return {
    health,
    jumping,
    position,
    attributes,
  };
}

function readBrowserNested(b) {
  return {
    str: pckBrowser.readI32(b),
    agi: pckBrowser.readI32(b),
    int: pckBrowser.readI32(b),
  };
}

function writeNodeData(w, v) {
  pckNode.writeBitSet(w,
    w.jumping,
  );

  pckNode.writeI32(w, v.health);
  pckNode.writeArray(w, v.position, pckBrowser.writeI32);
  writeNodeNested(w, v.attributes);
}

function writeNodeNested(w, v) {
  pckNode.writeI32(w, v.str);
  pckNode.writeI32(w, v.agi);
  pckNode.writeI32(w, v.int);
}

function readNodeData(b) {
  const bitSet1 = pckNode.readU8(b);
  const jumping = (bitSet1 & 1) !== 0;

  const health = pckNode.readI32(b);
  const position = pckNode.readArray(b, pckNode.readI32);
  const attributes = readNodeNested(b);

  return {
    health,
    jumping,
    position,
    attributes,
  };
}

function readNodeNested(b) {
  return {
    str: pckNode.readI32(b),
    agi: pckNode.readI32(b),
    int: pckNode.readI32(b),
  };
}

function encodePckBrowser() {
  const w = new pckBrowser.Writer();
  writeBrowserData(w, DATA);
  const a = new Uint8Array(w.size);
  pckBrowser.serialize(w, a);
  return a;
}

function decodePckBrowser() {
  return readBrowserData({ u: PCK_BROWSER_DATA, o: 0 });
}

function encodePckNode() {
  const w = new pckNode.Writer();
  writeNodeData(w, DATA);
  const a = Buffer.allocUnsafe(w.size);
  pckNode.serialize(w, a);
  return a;
}

function decodePckNode() {
  return readNodeData({ u: PCK_NODE_DATA, o: 0 });
}

function encodeJson() {
  return JSON.stringify(DATA);
}

function decodeJson() {
  return JSON.parse(JSON_DATA);
}

new benchmark.Suite()
  .add("encodePckBrowser", () => {
    encodePckBrowser();
  })
  .add("decodePckBrowser", () => {
    decodePckBrowser();
  })
  .add("encodePckNode", () => {
    encodePckNode();
  })
  .add("decodePckNode", () => {
    decodePckNode();
  })
  .add("encodeJson", () => {
    encodeJson();
  })
  .add("decodeJson", () => {
    decodeJson();
  })
  .on("complete", function () {
    for (let i = 0; i < this.length; i++) {
      console.log(this[i].toString());
    }
  })
  .run();
