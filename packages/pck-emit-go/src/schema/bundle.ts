import { Bundle, Schema, Field } from "pck";
import { GoSchema, convertToGoSchema } from "./schema";

export class GoBundle extends Bundle<GoSchema> {
}

export interface GoBundleOptions {
  readonly schemas?: (schema: GoSchema) => GoSchema;
}

export function goBundle(bundle: Bundle<Schema<Field>>, options?: GoBundleOptions): GoBundle {
  let schemas = bundle.schemas.map(convertToGoSchema);

  if (options !== undefined) {
    if (options.schemas !== undefined) {
      schemas = schemas.map(options.schemas);
    }
  }

  return new GoBundle(schemas, bundle.schemaTags, bundle.types);
}
