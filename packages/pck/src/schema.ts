import { Field } from "./field";

export class Schema<T extends Field> {
  readonly id: symbol;
  readonly fields: T[];

  constructor(id: symbol, fields: T[]) {
    this.id = id;
    this.fields = fields;
  }
}

/* tslint:disable:no-empty-interface */
export type RecursiveFieldArray<T> = T | IRecursiveFieldArray<T> | null;
export interface IRecursiveFieldArray<T> extends Array<RecursiveFieldArray<T>> { }
/* tslint:enable:no-empty-interface */

export function declareSchema<T extends Field>(id: symbol, fields: RecursiveFieldArray<T>[]): Schema<T> {
  return new Schema(id, normalizeFields(fields));
}

function normalizeFields<T extends Field>(fields: RecursiveFieldArray<T>[]): T[] {
  const result: T[] = [];
  _normalizeFields(result, fields);
  return result;
}

function _normalizeFields<T extends Field>(result: T[], fields: RecursiveFieldArray<T>[]): void {
  for (const f of fields) {
    if (f !== null) {
      if (Array.isArray(f)) {
        _normalizeFields(result, f);
      } else {
        result.push(f);
      }
    }
  }
}
