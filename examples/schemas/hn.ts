import { bundle, declareSchema, schema, utf8, varuint, array, uint32, omitEmpty, omitNull, VARUINT, SCHEMA } from "pck";

export const BUNDLE = bundle([
  declareSchema(
    "Item",
    [
      utf8("by"),
      varuint("descendants"),
      varuint("id"),
      omitEmpty(omitNull(array("kids", VARUINT()))),
      varuint("score"),
      uint32("time"),
      utf8("title"),
      omitEmpty(utf8("url")),
    ],
  ),

  declareSchema(
    "TopStories",
    [
      array("items", SCHEMA("Item")),
    ],
  ),
]);
