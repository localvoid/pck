const pck = require("pck");
const pckGo = require("pck-emit-go");

const Position = pck.schema(
  Symbol.for("pck.Position"),
  [
    pck.varint("x"),
    pck.varint("y"),
  ],
);

const Attributes = pck.schema(
  Symbol.for("pck.Attributes"),
  [
    pck.uint8("str"),
    pck.uint8("agi"),
    pck.uint8("int"),
  ],
);

const User = pck.schema(
  Symbol.for("pck.User"),
  [
    pck.varint("health"),
    pck.bool("jumping"),
    pck.ref("position", Symbol.for("pck.Position")),
    pck.ref("attributes", Symbol.for("pck.Attributes")),
  ],
);

module.exports = pck.bundle([
  pckGo.goSchema({
    schema: Position,
    struct: "Position",
  }),
  pckGo.goSchema({
    schema: Attributes,
    struct: "Attributes",
  }),
  pckGo.goSchema({
    schema: User,
    struct: "User",
  }),
]);
