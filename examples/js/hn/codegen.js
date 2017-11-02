const fs = require("fs");
const osh = require("osh");
const oshDebug = require("osh-debug");
const jsEmit = require("pck-emit-js");
const bundle = require("../../schemas/hn");

const FILE = "./pck.js";

try {
  fs.writeFileSync(
    FILE,
    jsEmit.inject(
      {
        bundle: bundle,
        mode: "js",
        jsOptions: {
          module: "commonjs",
        },
      },
      fs.readFileSync(FILE).toString(),
    ),
  );
} catch (e) {
  if (e[osh.STACK_TRACE]) {
    console.log(oshDebug.stackTraceToString(e[osh.STACK_TRACE]));
  }
  throw e;
}
