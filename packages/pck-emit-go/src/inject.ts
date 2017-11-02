import { createDirectiveMatcher, inject as _inject } from "incode";
import { line } from "osh-code";
import { Bundle, Schema } from "pck";
import { lib } from "./codegen/lib";
import { sizeMethod } from "./codegen/size";
import { pckMethod } from "./codegen/pck";
import { unpckMethod } from "./codegen/unpck";
import { EmitOptions, emit } from "./emit";

interface InjectableData {
  readonly schema: string;
}

const DIRECTIVE_MATCHER = createDirectiveMatcher("pck");

export function inject(options: EmitOptions, text: string): string {
  const bundle = options.bundle;

  return _inject(
    text,
    DIRECTIVE_MATCHER,
    (region) => {
      const data = region.data as InjectableData;
      let children;
      switch (region.type) {
        case "lib":
          children = lib();
          break;
        case "methods":
          const schema = extractSchema(data, bundle);
          children = [
            sizeMethod(schema),
            line(),
            pckMethod(schema),
            line(),
            unpckMethod(schema),
          ];
          break;
        case "size":
          children = sizeMethod(extractSchema(data, bundle));
          break;
        case "pck":
          children = pckMethod(extractSchema(data, bundle));
          break;
        case "unpck":
          children = unpckMethod(extractSchema(data, bundle));
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

function extractSchema(data: InjectableData, bundle: Bundle): Schema {
  const schemaName: string | undefined = data.schema;
  let schema;
  if (schemaName === void 0) {
    throw new Error(`Unable to find schema.`);
  }
  if (typeof schemaName !== "string") {
    throw new Error(`Invalid schema name. Invalid type: ${typeof schemaName}.`);
  }
  schema = bundle.findSchemaByName(schemaName);
  if (schema === void 0) {
    throw new Error(`Unable to find schema with a name "${schemaName}".`);
  }

  return schema;
}
