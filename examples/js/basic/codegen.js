const fs = require("fs");
const jsEmit = require("pck-emit-js");
const bundle = require("../../schemas/basic");

const FILE = "./code.ts";

fs.writeFileSync(
  FILE,
  jsEmit.inject(
    {
      bundle: bundle,
      mode: "ts",
    },
    fs.readFileSync(FILE).toString(),
  ),
);
