import { Type } from "./type";
import { Field } from "./field";
import { Schema } from "./schema";
import { Binder } from "./binder";

export class Bundle<T extends Schema<F>, F extends Field> {
  readonly binder: Binder<T, F>;
  readonly schemas: T[];
  readonly types: Set<Type>;
  readonly taggedSchemas: Map<symbol, number>;

  constructor(
    binder: Binder<T, F>,
    schemas: T[],
    types: Set<Type>,
    taggedSchemas: Map<symbol, number>,
  ) {
    this.binder = binder;
    this.schemas = schemas;
    this.types = types;
    this.taggedSchemas = taggedSchemas;
  }

  getSchemaTag(schema: T): number | undefined {
    return this.taggedSchemas.get(schema.id);
  }
}

export function bundle<T extends Schema<F>, F extends Field>(schemas: T[]): Bundle<T, F> {
  const binder = new Binder<T, F>();
  for (const schema of schemas) {
    binder.addSchema(schema);
  }

  const analyzeResult = analyzeSchemas(binder, schemas);

  return new Bundle<T, F>(binder, schemas, analyzeResult.types, analyzeResult.taggedSchemas);
}

interface AnalyzeResult {
  readonly types: Set<Type>;
  readonly taggedSchemas: Map<symbol, number>;
}

function analyzeSchemas<T extends Schema<F>, F extends Field>(binder: Binder<T, F>, schemas: T[]): AnalyzeResult {
  const types = new Set<Type>();
  const taggedSchemas = new Map<symbol, number>();
  let tagIndex = 0;

  for (const schema of schemas) {
    for (const field of schema.fields) {
      types.add(field.type);

      if (field.type.id === "union") {
        for (const schemaId of field.type.symbols) {
          if (!taggedSchemas.has(schemaId)) {
            taggedSchemas.set(schemaId, tagIndex++);
          }
        }
      }
    }
  }

  return { types, taggedSchemas };
}
