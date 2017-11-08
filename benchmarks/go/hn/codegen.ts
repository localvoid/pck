import * as fs from "fs";
import { STACK_TRACE } from "osh";
import { stackTraceToString } from "osh-debug";
import { goBundle, createGoBinder, inject } from "pck-emit-go";
import { BUNDLE } from "../../../examples/schemas/hn";

const FILE = "./code.go";

try {
  fs.writeFileSync(
    FILE,
    inject(
      {
        binder: createGoBinder(goBundle(BUNDLE)),
      },
      fs.readFileSync(FILE).toString(),
    ),
  );
} catch (e) {
  if (e[STACK_TRACE]) {
    console.log(stackTraceToString(e[STACK_TRACE]));
  }
  throw e;
}
