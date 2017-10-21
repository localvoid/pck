import { Type as pckType, Field } from "pck";
import { Context, TChildren, component, ComponentNode } from "osh";

export const VARS = Symbol("Vars");
export const TYPED = Symbol("Typed");

export function isNotNull(...children: TChildren[]) {
  return ["((", children, ") !== null)"];
}

export function isNotEmpty(...children: TChildren[]) {
  return ["((", children, ").length > 0)"];
}

export function isTrue(...children: TChildren[]) {
  return ["((", children, ") === true)"];
}

export function call(fn: TChildren, args: TChildren[]) {
  const r = [fn, "("];
  if (args.length > 0) {
    r.push(args[0]);
    for (let i = 1; i < args.length; ++i) {
      r.push(", ", args[i]);
    }
  }
  r.push(")");
  return r;
}

export function and(...children: TChildren[]) {
  if (children.length === 1) {
    return children;
  }
  const r = [children[0]];
  for (let i = 1; i < children.length; ++i) {
    r.push(" && ", children[i]);
  }
  return ["(", r, ")"];
}

export function isTyped(ctx: Context): boolean {
  return ctx[TYPED] === true;
}

const has = Object.prototype.hasOwnProperty;

export function V(ctx: Context, symbol: string) {
  const vars = ctx[VARS];
  if (vars === void 0) {
    throw new Error("Unable to locate VARS object in context");
  }
  if (!has.call(vars, symbol)) {
    throw new Error(`Unable to locate "${symbol}" variable`);
  }
  return `${vars[symbol]}`;
}

export function v(symbol: string): ComponentNode<string> {
  return component(V, symbol);
}

export function Type(ctx: Context, children: TChildren[]) {
  if (isTyped(ctx)) {
    return children;
  }
  return null;
}

export function type(...children: TChildren[]) {
  return component(Type, children);
}

export function Getter(ctx: Context, field: Field) {
  return `this.${field.name}`;
}

export function getter(field: Field) {
  return component(Getter, field);
}

export function typeToString(t: pckType): string {
  if (t.isBoolean()) {
    return `bool`;
  }
  if (t.isNumber()) {
    if (t.isVariadicInteger()) {
      if (t.isSignedInteger()) {
        return `ivar`;
      } else {
        return `uvar`;
      }
    }
    if (t.isInteger()) {
      if (t.isSignedInteger()) {
        return `i${t.size * 8}`;
      } else {
        return `u${t.size * 8}`;
      }
    }
    if (t.isFloat()) {
      return `f${t.size * 8}`;
    }
  }
  if (t.isString()) {
    if (t.isUtf8String()) {
      return `utf8`;
    } else {
      if (t.hasDynamicSize()) {
        return `ascii`;
      } else {
        return `ascii[${t.size}]`;
      }
    }
  }
  if (t.isByteArray()) {
    if (t.hasDynamicSize()) {
      return `bytes`;
    } else {
      return `bytes[${t.size}]`;
    }
  }
  if (t.isArray()) {
    if (t.hasDynamicSize()) {
      return `array`;
    } else {
      return `array[${t.props.length}]`;
    }
  }
  if (t.isRef()) {
    return `ref[${t.props.name}]`;
  }
  return `UNKNOWN`;
}

export function fieldToString(field: Field): string {
  let t = typeToString(field.type);
  if (field.isOptional()) {
    t = `optional(${t})`;
  }
  if (field.isOmitEmpty()) {
    t = `omitEmpty(${t})`;
  }
  return `${field.name}: ${t}`;
}
