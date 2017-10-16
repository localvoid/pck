"use strict"

const benchmark = require("benchmark");
const pck = require("pck-browser");

const DATA = {
  id: "123456789012345678901234",
  name: "Test Name",
  health: 100,
  jumping: true,
  position: [10, 20],
  attributes: {
    str: 100,
    agi: 50,
    int: 10,
  },
};

const PCK_DATA = encodePck();
const JSON_DATA = JSON.stringify(DATA);

function writeData(w, v) {
  pck.writeBitSet(w,
    w.jumping,
  );

  pck.writeFixedAscii(w, v.id, 24);
  pck.writeUtf8(w, v.name);
  pck.writeI32(w, v.health);
  pck.writeArray(w, v.position, pck.writeI32);
  writeNested(w, v.attributes);
}

function writeNested(w, v) {
  pck.writeI32(w, v.str);
  pck.writeI32(w, v.agi);
  pck.writeI32(w, v.int);
}

function readData(b) {
  const bitSet1 = pck.readU8(b);
  const jumping = (bitSet1 & 1) !== 0;

  const id = pck.readFixedUtf8(b, 24);
  const name = pck.readUtf8(b);
  const health = pck.readI32(b);
  const position = pck.readArray(b, pck.readI32);
  const attributes = readNested(b);

  return {
    id,
    name,
    health,
    jumping,
    position,
    attributes,
  };
}

function readNested(b) {
  return {
    str: pck.readI32(b),
    agi: pck.readI32(b),
    int: pck.readI32(b),
  };
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
