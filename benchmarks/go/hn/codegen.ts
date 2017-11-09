import * as fs from "fs";
import { STACK_TRACE } from "osh";
import { stackTraceToString } from "osh-debug";
import { goBundle, transformGoSchema, transformGoField, GoArrayType, REF, createGoBinder, inject } from "pck-emit-go";
import { BUNDLE } from "../../../examples/schemas/hn";

const FILE = "./code.go";

const GO_BUNDLE = goBundle(BUNDLE, {
  schemas: (schema) => {
    switch (schema.id) {
      case "TopStories":
        return transformGoSchema(schema, {
          fields: (field) => {
            switch (field.name) {
              case "Items":
                return transformGoField(field, {
                  type: (type: GoArrayType) => type.withValueType(REF(type.valueType)),
                });
            }
            return field;
          },
        });
    }
    return schema;
  },
});

try {
  fs.writeFileSync(
    FILE,
    inject(
      {
        binder: createGoBinder(GO_BUNDLE),
      },
      fs.readFileSync(FILE).toString(),
    ),
  );
} catch (e) {
  if (e[STACK_TRACE]) {
    console.log(stackTraceToString(e[STACK_TRACE]));
  }
  throw e;
}
