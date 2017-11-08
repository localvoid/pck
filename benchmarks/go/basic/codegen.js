const fs = require("fs");
const osh = require("osh");
const oshDebug = require("osh-debug");
const goEmit = require("pck-emit-go");
const bundle = require("./schema");

const FILE = "./code.go";

try {
  fs.writeFileSync(
    FILE,
    goEmit.inject(
      {
        binder: goEmit.createGoBinder(goEmit.goBundle(bundle)),
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
