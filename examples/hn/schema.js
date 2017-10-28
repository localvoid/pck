const pck = require("pck");

const Item = pck.schema(
  pck.utf8("by"),
  pck.uvar("descendants"),
  pck.uvar("id"),
  pck.omitEmpty(pck.omitNull(pck.array("kids", pck.UVAR))),
  pck.uvar("score"),
  pck.u32("time"),
  pck.utf8("title"),
  pck.omitEmpty(pck.utf8("url")),
);

const TopStories = pck.schema(
  pck.array("items", pck.REF(Item)),
);

module.exports = pck.bundle([
  pck.importSchema("Item", Item),
  pck.importSchema("TopStories", TopStories),
]);
