import { Type } from "./type";
import { Field } from "./field";
import { Schema } from "./schema";

export class Bundle {
  readonly schemas: Schema<Field>[];
  readonly schemaTags: Map<symbol, number>;
  readonly types: Set<Type>;

  constructor(schemas: Schema<Field>[], schemaTags: Map<symbol, number>, types: Set<Type>) {
    this.schemas = schemas;
    this.schemaTags = schemaTags;
    this.types = types;
  }
}

/**
 * bundle creates a Bundle from an array of schemas.
 *
 * @param schemas An array of schemas to bundle.
 */
export function bundle(schemas: Schema<Field>[]): Bundle {
  const schemaTags = new Map<symbol, number>();
  const types = new Set<Type>();
  const taggedSchemas = new Set<symbol>();

  // Schemas should be tagged by order of appearance in the array of schemas.
  // With a first loop we are marking all schemas that appear in tagged unions and in the second loop we assigning
  // tags.
  for (const schema of schemas) {
    for (const field of schema.fields) {
      types.add(field.type);

      if (field.type.id === "union") {
        for (const schemaId of field.type.symbols) {
          taggedSchemas.add(schemaId);
        }
      }
    }
  }

  let tagIndex = 0;
  for (const schema of schemas) {
    if (taggedSchemas.has(schema.id)) {
      schemaTags.set(schema.id, tagIndex++);
    }
  }

  return new Bundle(schemas, schemaTags, types);
}
