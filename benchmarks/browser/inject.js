const fs = require("fs");
const osh = require("osh");
const oshDebug = require("osh-debug");
const jsEmit = require("pck-emit-js");
const bundle = require("../../examples/hn/schema");

const FILE = "./src/hn.ts";

try {
  fs.writeFileSync(
    FILE,
    jsEmit.inject(
      {
        bundle: bundle,
        jsOptions: {
          lang: "ts",
          module: "es2015",
          target: "browser",
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
