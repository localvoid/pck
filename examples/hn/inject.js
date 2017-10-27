const fs = require("fs");
const osh = require("osh");
const jsEmit = require("pck-emit-js");
const bundle = require("./schema");

const FILE = "./pck.js";

try {
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
} catch (e) {
  if (e[osh.STACK_TRACE]) {
    console.log(e[osh.STACK_TRACE]);
  }
  throw e;
}
