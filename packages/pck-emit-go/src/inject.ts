import { createDirectiveMatcher, inject as _inject } from "incode";
import { line } from "osh-code";
import { Bundle } from "pck";
import { lib } from "./codegen/lib";
import { sizeMethod } from "./codegen/size";
import { pckMethod } from "./codegen/pck";
import { unpckMethod } from "./codegen/unpck";
import { EmitOptions, emit } from "./emit";
import { GoField, GoSchema } from "./schema";

const DIRECTIVE_MATCHER = createDirectiveMatcher("pck");

export function inject(options: EmitOptions, text: string): string {
  const bundle = options.bundle;

  return _inject(
    text,
    DIRECTIVE_MATCHER,
    (region) => {
      let children;
      switch (region.args[0]) {
        case "lib":
          children = lib();
          break;
        case "methods":
          const schema = getSchema(bundle, region.args[1]);
          children = [
            sizeMethod(schema),
            line(),
            pckMethod(schema),
            line(),
            unpckMethod(schema),
          ];
          break;
        case "size":
          children = sizeMethod(getSchema(bundle, region.args[1]));
          break;
        case "pck":
          children = pckMethod(getSchema(bundle, region.args[1]));
          break;
        case "unpck":
          children = unpckMethod(getSchema(bundle, region.args[1]));
          break;
      }

      return (
        "\n\n" +
        emit(
          {
            ...options,
            ...{
              padding: region.padding,
            },
          },
          children,
        ) +
        "\n"
      );
    },
  );
}

function getSchema(bundle: Bundle<GoSchema, GoField>, schemaName: any): GoSchema {
  let schema;
  if (schemaName === void 0) {
    throw new Error(`Unable to find schema.`);
  }
  if (typeof schemaName !== "string") {
    throw new Error(`Invalid schema name. Invalid type: ${typeof schemaName}.`);
  }
  for (const s of bundle.schemas) {
    if (s.struct === schemaName) {
      schema = s;
      break;
    }
  }
  if (schema === void 0) {
    throw new Error(`Unable to find schema with a name "${schemaName}".`);
  }

  return schema;
}
