const fs = require("fs");
const pck = require("pck");
const jsEmit = require("pck-emit-js");
const schema = require("./schema");

const FILE = "./code.ts";

fs.writeFileSync(
  FILE,
  jsEmit.inject(
    {
      bundle: pck.bundle([schema.Attributes, schema.User]),
      mode: "ts",
    },
    fs.readFileSync(FILE).toString(),
  ),
);
