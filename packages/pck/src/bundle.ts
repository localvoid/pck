import { Type } from "./type";
import { Field } from "./field";
import { Schema } from "./schema";
import { Binder } from "./binder";

export class Bundle<T extends Schema<F>, F extends Field> {
  readonly binder: Binder<T, F>;
  readonly types: Set<Type>;

  constructor(binder: Binder<T, F>, types: Set<Type>) {
    this.binder = binder;
    this.types = types;
  }
}

export function bundle<T extends Schema<F>, F extends Field>(schemas: T[]): Bundle<T, F> {
  const analyzeResult = analyzeSchemas(schemas);
  const binder = new Binder<T, F>(analyzeResult.schemaIndex, analyzeResult.schemaTags);
  return new Bundle<T, F>(binder, analyzeResult.types);
}

interface AnalyzeResult<T extends Schema<F>, F extends Field> {
  readonly types: Set<Type>;
  readonly schemaIndex: Map<symbol, T>;
  readonly schemaTags: Map<symbol, number>;
}

function analyzeSchemas<T extends Schema<F>, F extends Field>(schemas: T[]): AnalyzeResult<T, F> {
  const schemaIndex = new Map<symbol, T>();
  const schemaTags = new Map<symbol, number>();
  const types = new Set<Type>();
  let tagIndex = 0;

  for (const schema of schemas) {
    for (const field of schema.fields) {
      types.add(field.type);

      if (field.type.id === "union") {
        for (const schemaId of field.type.symbols) {
          if (!schemaTags.has(schemaId)) {
            schemaTags.set(schemaId, tagIndex++);
          }
        }
      }
    }
  }

  return { schemaIndex, schemaTags, types };
}
