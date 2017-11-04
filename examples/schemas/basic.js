const pck = require("pck");

const Attributes = pck.schema(pck.u8("str"), pck.u8("agi"), pck.u8("int"));
const User = pck.schema(
  pck.utf8("name"),
  pck.u8("age"),
  pck.bool("jumping"),
  pck.omitEmpty(pck.array("items", pck.U32)),
  pck.ref("attributes", Attributes),
);

module.exports = pck.bundle([
  pck.importSchema("Attributes", Attributes),
  pck.importSchema("User", User),
]);

const Example = schema(
  Symbol("Example"),
  [
    utf8("name"),
    omitNull(omitEmpty(array("items", U32))),
    ref("attributes", Symbol.for("Attributes")),
  ],
);

const GoExample = goSchema(
  Example,
  {
    struct: "Example",
    constructor: "NewExample",
    fields: pipe(capitalizeFieldNames, (f) => {
      switch (f.name) {
        case "Attributes":
          return embed(f);
        case "Age":
          return castToInt16(f);
      }
      return f;
    }),
  },
);
