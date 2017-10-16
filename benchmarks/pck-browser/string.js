"use strict"

const benchmark = require("benchmark");
const pck = require("pck-browser");

const DATA = {
  s: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
};

const PCK_DATA = encodePck();
const JSON_DATA = JSON.stringify(DATA);

function writeData(w, v) {
  pck.writeUtf8(w, v.s);
}

function readData(b) {
  const s = pck.readUtf8(b);

  return { s };
}

function encodePck() {
  const w = new pck.Writer();
  writeData(w, DATA);
  const a = new Uint8Array(w.size);
  pck.serialize(w, a);
  return a;
}

function decodePck() {
  return readData({ u: PCK_DATA, o: 0 });
}

function encodeJson() {
  return JSON.stringify(DATA);
}

function decodeJson() {
  return JSON.parse(JSON_DATA);
}

new benchmark.Suite()
  .add("encodePck", () => {
    encodePck();
  })
  .add("decodePck", () => {
    decodePck();
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
