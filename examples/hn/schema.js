const pck = require("pck");

const Item = pck.schema(
  "Item",
  [
    pck.utf8("by"),
    pck.uvar("descendants"),
    pck.uvar("id"),
    pck.optional(pck.array("kids", pck.UVAR)),
    pck.uvar("score"),
    pck.u32("time"),
    pck.utf8("title"),
    pck.omitEmpty(pck.utf8("url")),
  ],
);

module.exports = {
  Item,
};
