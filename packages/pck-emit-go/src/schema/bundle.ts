import { Bundle, Schema, Field } from "pck";
import { GoSchema, goSchema } from "./schema";

export class GoBundle extends Bundle<GoSchema> {
}

export interface GoBundleOptions {
  readonly bundle: Bundle<Schema<Field>>;
  readonly schemas?: (schema: Schema<Field>) => GoSchema;
}

export function goBundle(options: GoBundleOptions): GoBundle {
  const bundle = options.bundle;
  const schemaTransformer = options.schemas === undefined
    ? (schema: Schema<Field>) => goSchema({ schema })
    : options.schemas;

  return new GoBundle(bundle.schemas.map(schemaTransformer), bundle.schemaTags, bundle.types);
}
