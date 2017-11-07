import { Binder } from "pck";
import { GoField } from "./field";
import { GoSchema } from "./schema";
import { GoBundle } from "./bundle";

export class GoBinder extends Binder<GoSchema, GoField> {
  private readonly schemaNameIndex: Map<string, GoSchema>;

  constructor(schemas: GoSchema[], schemaTags: Map<string, number>) {
    super(schemas, schemaTags);
    this.schemaNameIndex = new Map<string, GoSchema>();
    schemas.forEach((schema) => {
      this.schemaNameIndex.set(schema.struct, schema);
    });
  }

  findSchemaByName(name: string): GoSchema {
    const schema = this.schemaNameIndex.get(name);
    if (schema === undefined) {
      throw new Error(`Unable to find schema with name "${name}".`);
    }
    return schema;
  }
}

export function createGoBinder(bundle: GoBundle): GoBinder {
  return new GoBinder(bundle.schemas, bundle.schemaTags);
}
