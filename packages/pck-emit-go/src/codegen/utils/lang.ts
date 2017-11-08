import { TChildren } from "osh";
import { intersperse } from "osh-text";
import { line } from "osh-code";
import { arg } from "./symbols";

export function callMethod(obj: TChildren, method: TChildren, args?: TChildren[]): TChildren {
  if (args === undefined) {
    return [obj, ".", method, "()"];
  }
  return [obj, ".", method, "(", intersperse(args, ", "), ")"];
}

export function callFunc(func: TChildren, args?: TChildren[]): TChildren {
  if (args === undefined) {
    return [func, "()"];
  }
  return [func, "(", intersperse(args, ", "), ")"];
}

export function len(...children: TChildren[]): TChildren {
  return callFunc("len", [children]);
}

export function isNotNil(...children: TChildren[]): TChildren {
  return [children, " != nil"];
}

export function isTrue(...children: TChildren[]): TChildren {
  return children;
}

export function castTo(to: TChildren, value: TChildren): TChildren {
  return [to, "(", value, ")"];
}

export function castToByte(...children: TChildren[]): TChildren {
  return castTo("byte", children);
}

export function castToUint8(...children: TChildren[]): TChildren {
  return castTo("uint8", children);
}

export function castToUint16(...children: TChildren[]): TChildren {
  return castTo("uint16", children);
}

export function castToUint32(...children: TChildren[]): TChildren {
  return castTo("uint32", children);
}

export function castToUint64(...children: TChildren[]): TChildren {
  return castTo("uint64", children);
}

export function castToInt8(...children: TChildren[]): TChildren {
  return castTo("int8", children);
}

export function castToInt16(...children: TChildren[]): TChildren {
  return castTo("int16", children);
}

export function castToInt32(...children: TChildren[]): TChildren {
  return castTo("int32", children);
}

export function castToInt64(...children: TChildren[]): TChildren {
  return castTo("int64", children);
}

export function castToFloat(...children: TChildren[]): TChildren {
  return castTo("float", children);
}

export function castToDouble(...children: TChildren[]): TChildren {
  return castTo("double", children);
}

export function castToString(...children: TChildren[]): TChildren {
  return castTo("string", children);
}

export function castToInt(...children: TChildren[]): TChildren {
  return castTo("int", children);
}

export class Value {
  readonly value: TChildren;

  constructor(value: TChildren) {
    this.value = value;
  }

  assign(value: TChildren): TChildren {
    return [this.value, " = ", value];
  }

  assignAt(offset: number, value: TChildren, start?: TChildren): TChildren {
    return [this.at(offset, start), " = ", value];
  }

  at(offset: number, start?: TChildren): TChildren {
    if (start !== undefined) {
      if (offset === 0) {
        return [this.value, "[", start, "]"];
      } else {
        return [this.value, "[", start, offset > 0 ? "+" : "-", offset, "]"];
      }
    }
    return [this.value, "[", offset, "]"];
  }

  slice(opts: { start?: TChildren, end?: TChildren, startOffset?: number, endOffset?: number }): TChildren {
    const r: TChildren = [this.value, "["];
    if (opts.start !== undefined) {
      r.push(opts.start);
      if (opts.startOffset !== undefined && opts.startOffset !== 0) {
        r.push((opts.startOffset > 0) ? "+" : "-");
      }
    }
    if (opts.startOffset !== undefined && opts.startOffset !== 0) {
      r.push(opts.startOffset);
    }
    r.push(":");
    if (opts.end !== undefined) {
      r.push(opts.end);
      if (opts.endOffset !== undefined && opts.endOffset !== 0) {
        r.push((opts.endOffset > 0) ? "+" : "-", opts.endOffset);
      }
    }
    if (opts.endOffset !== undefined && opts.endOffset !== 0) {
      r.push(opts.endOffset);
    }
    r.push("]");
    return r;
  }
}

const _SELF = arg("self");
const _BUF = arg("buf");

export function SELF(property?: TChildren, value?: TChildren): TChildren {
  if (property === undefined) {
    return _SELF;
  }
  if (value === undefined) {
    return [_SELF, ".", property];
  }
  return [_SELF, ".", property, " = ", value];
}

export const BUF = new Value(_BUF);

/**
 * https://golang.org/src/encoding/binary/binary.go
 * https://golang.org/issue/14808
 *
 * @param offset Bound check offset.
 */
export function boundCheckHint(offset: number): TChildren {
  return line("_ = ", BUF.at(offset));
}
