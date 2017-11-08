import { bundle, declareSchema, uint8, varint, schema, bool } from "pck";

export const BUNDLE = bundle([
  declareSchema(
    "Position",
    [
      varint("x"),
      varint("y"),
    ],
  ),

  declareSchema(
    "Attributes",
    [
      uint8("str"),
      uint8("agi"),
      uint8("int"),
    ],
  ),

  declareSchema(
    "User",
    [
      varint("health"),
      bool("jumping"),
      schema("position", "Position"),
      schema("attributes", "Attributes"),
    ],
  ),
]);
