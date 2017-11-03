import { Field } from "./field";

export class Schema {
  readonly id: symbol;
  readonly fields: Field[];

  constructor(id: symbol, fields: Field<any>[]) {
    this.id = id;
    this.fields = fields;
  }
}

/* tslint:disable:no-empty-interface */
export type RecursiveFieldArray = Field | IRecursiveFieldArray | null;
export interface IRecursiveFieldArray extends Array<RecursiveFieldArray> { }
/* tslint:enable:no-empty-interface */

export function schema(id: symbol, fields: RecursiveFieldArray[]): Schema {
  return new Schema(id, normalizeFields(fields));
}

function normalizeFields(fields: RecursiveFieldArray[]): Field<any>[] {
  const result: Field<any>[] = [];
  _normalizeFields(result, fields);
  return result;
}

function _normalizeFields(result: Field[], fields: RecursiveFieldArray[]): void {
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
