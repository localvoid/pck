"use strict"

const benchmark = require("benchmark");
const pckBrowser = require("pck-browser");
const pckNode = require("pck-node");

const DATA = {
  s: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  // s: "1234567890",
};

const PCK_BROWSER_DATA = encodePckBrowser();
const PCK_NODE_DATA = encodePckNode();
const JSON_DATA = JSON.stringify(DATA);

function writeBrowserData(w, v) {
  pckBrowser.writeUtf8(w, v.s);
}

function readBrowserData(b) {
  const s = pckBrowser.readUtf8(b);

  return {
    s
  };
}

function writeNodeData(w, v) {
  pckNode.writeUtf8(w, v.s);
}

function readNodeData(b) {
  const s = pckNode.readUtf8(b);

  return {
    s
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
