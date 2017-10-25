const fs = require("fs");
const jsEmit = require("pck-emit-js");
const bundle = require("./schema");

const FILE = "./pck.js";

fs.writeFileSync(
  FILE,
  jsEmit.inject(
    {
      bundle: bundle,
      mode: "js",
    },
    fs.readFileSync(FILE).toString(),
  ),
);
