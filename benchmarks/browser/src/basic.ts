
import * as __pck from "pck-browser";

const DATA = {
  "health": 100,
  "jumping": true,
  "position": {
    "x": 10,
    "y": 20,
  },
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

  __pck.writeIVar(w, v["health"]);
  writePosition(w, v["position"]);
  writeAttributes(w, v["attributes"]);
}

function writePosition(w: __pck.Writer, v: any): void {
  __pck.writeIVar(w, v["x"]);
  __pck.writeIVar(w, v["y"]);
}

function writeAttributes(w: __pck.Writer, v: any): void {
  __pck.writeI8(w, v["str"]);
  __pck.writeI8(w, v["agi"]);
  __pck.writeI8(w, v["int"]);
}

function readData(b: __pck.ReadBuffer): any {
  const bitSet1 = __pck.readU8(b);
  const jumping = (bitSet1 & 1) !== 0;

  const health = __pck.readIVar(b);
  const position = readPosition(b);
  const attributes = readAttributes(b);

  return {
    "health": health,
    "jumping": jumping,
    "position": position,
    "attributes": attributes,
  };
}

function readPosition(b: __pck.ReadBuffer): any {
  return {
    "x": __pck.readIVar(b),
    "y": __pck.readIVar(b),
  };
}

function readAttributes(b: __pck.ReadBuffer): any {
  return {
    "str": __pck.readU8(b),
    "agi": __pck.readU8(b),
    "int": __pck.readU8(b),
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
