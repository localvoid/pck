import { Context, TChildren, ComponentNode, component } from "osh";
import { docComment, line, indent } from "osh-code";
import { Schema } from "pck";
import { getBundle } from "./bundle";
import { schemaName } from "./schema";

export function TaggedReaders(ctx: Context): TChildren {
  const bundle = getBundle(ctx);

  return [
    docComment(
      line("TAGGED_READERS is an automatically generated list of tagged readers"),
    ),
    line("export const TAGGED_READERS = ["),
    indent(orderedTaggedSchemas(bundle.taggedSchemas).map((s) => line("read", schemaName(s), ","))),
    line("];"),
  ];
}

export function taggedReaders(): ComponentNode<undefined> {
  return component(TaggedReaders);
}

function orderedTaggedSchemas(taggedSchemas: Map<Schema, number>): Schema[] {
  const schemas: Array<{ tag: number, schema: Schema }> = [];
  taggedSchemas.forEach((tag, schema) => {
    schemas.push({ tag, schema });
  });
  schemas.sort((a, b) => b.tag - a.tag);

  return schemas.map((s) => s.schema);
}
