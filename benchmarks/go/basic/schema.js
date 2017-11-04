const pck = require("pck");
const pckGo = require("pck-emit-go");

const Position = pck.declareSchema(
  Symbol.for("pck.Position"),
  [
    pck.varint("x"),
    pck.varint("y"),
  ],
);

const Attributes = pck.declareSchema(
  Symbol.for("pck.Attributes"),
  [
    pck.uint8("str"),
    pck.uint8("agi"),
    pck.uint8("int"),
  ],
);

const User = pck.declareSchema(
  Symbol.for("pck.User"),
  [
    pck.varint("health"),
    pck.bool("jumping"),
    pck.schema("position", Symbol.for("pck.Position")),
    pck.schema("attributes", Symbol.for("pck.Attributes")),
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
    fields: (f) => {
      switch (f.name) {
        case "position":
        case "attributes":
          return pckGo.embed(f);
      }
      return f;
    },
  }),
]);
