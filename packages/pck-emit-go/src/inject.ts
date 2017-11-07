import { createDirectiveMatcher, inject as _inject } from "incode";
import { line } from "osh-code";
import { GoSchema, GoBinder } from "./schema";
import { lib, sizeMethod, pckMethod, unpckMethod } from "./codegen";
import { EmitOptions, emit } from "./emit";

const DIRECTIVE_MATCHER = createDirectiveMatcher("pck");

export function inject(options: EmitOptions, text: string): string {
  const binder = options.binder;

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
          const schema = getSchema(binder, region.args[1]);
          children = [
            sizeMethod(binder, schema),
            line(),
            pckMethod(binder, schema),
            line(),
            unpckMethod(binder, schema),
          ];
          break;
        case "size":
          children = sizeMethod(binder, getSchema(binder, region.args[1]));
          break;
        case "pck":
          children = pckMethod(binder, getSchema(binder, region.args[1]));
          break;
        case "unpck":
          children = unpckMethod(binder, getSchema(binder, region.args[1]));
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

function getSchema(binder: GoBinder, schemaName: any): GoSchema {
  if (typeof schemaName !== "string") {
    throw new Error(`Invalid schema name. Invalid type: ${typeof schemaName}.`);
  }
  return binder.findSchemaByName(schemaName);
}
