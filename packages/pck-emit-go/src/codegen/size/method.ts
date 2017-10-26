import { Context, TChildren } from "osh";
import { line, indent } from "osh-code";
import { Field } from "pck";
import { getSchema, self, structName } from "../utils";

function callMethod(obj: TChildren, method: TChildren, args?: TChildren): TChildren {
  if (args === void 0) {
    return [obj, ".", method, "()"];
  }
  return [obj, ".", method, "(", args, ")"];
}

function sym(s: TChildren): TChildren {
  return s;
}

function len(children: TChildren): TChildren {
  return ["len(", children, ")"];
}

function sizeIVar(children: TChildren): TChildren {
  return [sym("sizeIVar"), "(", children, ")"];
}

function sizeUVar(children: TChildren): TChildren {
  return [sym("sizeIVar"), "(", children, ")"];
}

function fieldSize(field: Field<any>): TChildren {
  const type = field.type;
  if (type.hasDynamicSize()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return sizeIVar(self(field.name));
      }
      return sizeUVar(self(field.name));
    }

    if (type.isString() || type.isByteArray()) {
      return [sizeUVar(len(self(field.name))), " + ", len(self(field.name))];
    }

    if (type.isRef()) {
      return callMethod(self(field.name), "Size");
    }
  }

  return field.type.size;
}

function incFieldSize(field: Field<any>): TChildren {
  if (field.isOptional()) {
    if (field.isOmitNull()) {
      if (field.isOmitEmpty()) {
        return [
          line("if ", self(field.name), " != nil && ", len(self(field.name)), " > 0 {"),
          indent(line("n += ", fieldSize(field))),
          line("}"),
        ];
      }
      return [
        line("if ", self(field.name), " != nil {"),
        indent(line("n += ", fieldSize(field))),
        line("}"),
      ];
    } else if (field.isOmitZero()) {
      return [
        line("if ", self(field.name), " != 0 {"),
        indent(line("n += ", fieldSize(field))),
        line("}"),
      ];
    } else if (field.isOmitEmpty()) {
      return [
        line("if ", len(self(field.name)), " > 0 {"),
        indent(line("n += ", fieldSize(field))),
        line("}"),
      ];
    }
  }
  if (field.type.hasDynamicSize()) {
    return line("n += ", fieldSize(field));
  }
  return null;
}

export function SizeMethod(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  if (!schema.hasDynamicSize()) {
    return [
      line("func (", self(), " *", structName(), ") Size() int {"),
      indent(
        line("return ", schema.size),
      ),
      line("}"),
    ];
  }

  return [
    line("func (", self(), " *", structName(), ") Size() (n int) {"),
    indent(
      line("n = ", schema.size),
      schema.sortedFields.map(incFieldSize),
    ),
    line("}"),
  ];
}
