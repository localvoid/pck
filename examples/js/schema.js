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
import * as __pck from "pck-browser";

// pck:assign({"schema": "User"})
class User implements __pck.Serializable {
  // pck:emit("pck")
  // pck:end
}

// pck:emit("unpck")
// pck:end
`;

console.log(jsEmit.inject({ bundle: pck.bundle([User]), mode: "ts" }, CODE));
