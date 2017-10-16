import { Bundle } from "pck";
import * as browser from "./targets/browser";

export type Emitter = (bundle: Bundle) => string;

export function createEmitter(): Emitter {
  return (bundle: Bundle): string => {
    let result = "";

    result += browser.emitImports(bundle) + "\n\n";

    for (const schema of bundle.schemas) {
      result += browser.emitReadFunction(schema) + "\n\n";
      result += browser.emitWriteFunction(schema) + "\n\n";
    }

    return result;
  };
}
