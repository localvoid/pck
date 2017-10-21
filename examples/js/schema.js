const pck = require("pck");
const jsEmit = require("pck-emit-js");
const prettier = require("prettier");

const User = pck.schema(
  "User",
  [
    pck.utf8("name"),
    pck.optional(pck.u8("age")),
    pck.optional(pck.bool("jumping")),
    pck.omitEmpty(pck.optional(pck.array("items", pck.U32))),
  ],
);

const CODE = `
LINE1
  // pck:assign({"schema": "User"})
  // pck:emit("pck")
  asdasdsd
  // pck:end
END
`;

console.log(jsEmit.inject(pck.bundle([User]), CODE));
