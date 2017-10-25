const fs = require("fs");
const pck = require("pck");
const jsEmit = require("pck-emit-js");
const schema = require("./schema");

const FILE = "./pck.js";

fs.writeFileSync(
  FILE,
  jsEmit.inject(
    {
      bundle: pck.bundle([schema.Item]),
      mode: "js",
    },
    fs.readFileSync(FILE).toString(),
  ),
);
