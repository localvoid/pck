import { TChildren } from "osh";
import { arg } from "./symbols";

export function structName(): TChildren {
  return "";
}

export function self(property?: TChildren): TChildren {
  if (property === void 0) {
    return arg("self");
  }
  return [arg("self"), ".", property];
}
