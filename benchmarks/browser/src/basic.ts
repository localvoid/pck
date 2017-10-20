
import * as __pck from "pck-browser";

const DATA = {
  "health": 100,
  "jumping": true,
  "position": [10, 20],
  "attributes": {
    "str": 100,
    "agi": 50,
    "int": 10,
  },
};

const PCK = pckEncodeBasic();
const JSON_DATA = jsonEncodeBasic();

function writeData(w: __pck.Writer, v: any): void {
  __pck.writeBitSet(w,
    v["jumping"],
  );

  __pck.writeI32(w, v["health"]);
  __pck.writeArray(w, v["position"], __pck.writeI32);
  writeNested(w, v["attributes"]);
}

function writeNested(w: __pck.Writer, v: any): void {
  __pck.writeI32(w, v["str"]);
  __pck.writeI32(w, v["agi"]);
  __pck.writeI32(w, v["int"]);
}

function readData(b: __pck.ReadBuffer): any {
  const bitSet1 = __pck.readU8(b);
  const jumping = (bitSet1 & 1) !== 0;

  const health = __pck.readI32(b);
  const position = __pck.readArray(b, __pck.readI32);
  const attributes = readNested(b);

  return {
    "health": health,
    "jumping": jumping,
    "position": position,
    "attributes": attributes,
  };
}

function readNested(b: __pck.ReadBuffer): any {
  return {
    "str": __pck.readI32(b),
    "agi": __pck.readI32(b),
    "int": __pck.readI32(b),
  };
}

export function pckEncodeBasic() {
  const w = new __pck.Writer();
  writeData(w, DATA);
  const a = new Uint8Array(w.size);
  __pck.serialize(w, a);
  return a;
}

export function pckDecodeBasic() {
  return readData({ u: PCK, o: 0 });
}

export function jsonEncodeBasic() {
  return JSON.stringify(DATA);
}

export function jsonDecodeBasic() {
  return JSON.parse(JSON_DATA);
}
