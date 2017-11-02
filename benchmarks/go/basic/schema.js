const pck = require("pck");

const Position = pck.schema(
  pck.ivar("x"),
  pck.ivar("y"),
);

const Attributes = pck.schema(
  pck.u8("str"),
  pck.u8("agi"),
  pck.u8("int"),
);

const User = pck.schema(
  pck.ivar("health"),
  pck.bool("jumping"),
  pck.ref("position", Position),
  pck.ref("attributes", Attributes),
);

module.exports = pck.bundle([
  pck.importSchema("User", User),
  pck.importSchema("Attributes", Attributes),
  pck.importSchema("Position", Position),
]);
