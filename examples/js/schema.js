const pck = require("pck");

const Attributes = pck.schema(
  "Attributes",
  [
    pck.u8("str"),
    pck.u8("agi"),
    pck.u8("int"),
  ],
);

const User = pck.schema(
  "User",
  [
    pck.utf8("name"),
    pck.u8("age"),
    pck.bool("jumping"),
    pck.omitEmpty(pck.array("items", pck.U32)),
    pck.ref("attributes", Attributes),
  ],
);

module.exports = {
  Attributes,
  User,
};
