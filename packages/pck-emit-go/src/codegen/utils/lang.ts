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

export function slice(value: TChildren, start: TChildren, end?: TChildren): TChildren {
  if (end === undefined) {
    return [value, "[", start, ":]"];
  }
  return [value, "[", start, ":", end, "]"];
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

export function BUF(pos?: { start?: TChildren, offset: number }, value?: TChildren): TChildren {
  if (pos === undefined) {
    return _BUF;
  }
  let v;
  if (pos.start === undefined) {
    v = [_BUF, "[", pos.offset, "]"];
  } else if (pos.offset === 0) {
    v = [_BUF, "[", pos.start, "]"];
  } else {
    v = [_BUF, "[", pos.start, "+", pos.offset, "]"];
  }
  if (value === undefined) {
    return v;
  }
  return [v, " = ", value];
}

/**
 * https://golang.org/src/encoding/binary/binary.go
 * https://golang.org/issue/14808
 *
 * @param offset Bound check offset.
 */
export function boundCheckHint(offset: number): TChildren {
  return line("_ = ", BUF({ offset }));
}
