const pck = require("pck");
const pckGo = require("pck-emit-go");

const Position = pck.declareSchema(
  "Position",
  [
    pck.varint("x"),
    pck.varint("y"),
  ],
);

const Attributes = pck.declareSchema(
  "Attributes",
  [
    pck.uint8("str"),
    pck.uint8("agi"),
    pck.uint8("int"),
  ],
);

const User = pck.declareSchema(
  "User",
  [
    pck.varint("health"),
    pck.bool("jumping"),
    pck.schema("position", "Position"),
    pck.schema("attributes", "Attributes"),
  ],
);

module.exports = pck.bundle([
  Position,
  Attributes,
  User,
]);
