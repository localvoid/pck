export { calcVarUintSize, varUintBytes } from "./varint";
export { goName } from "./name";
export {
  callMethod, callFunc,
  len,
  isNotNil, isTrue,
  castTo, castToByte, castToUint8, castToUint16, castToUint32, castToUint64, castToInt8, castToInt16, castToInt32,
  castToInt64, castToFloat, castToDouble, castToString, castToInt,
  Value, SELF, BUF, boundCheckHint,
} from "./lang";
export { declInternal, declArgs, declVars, internal, arg, v } from "./symbols";
