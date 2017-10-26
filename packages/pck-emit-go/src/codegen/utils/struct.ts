import { TChildren } from "osh";
import { v } from "./vars";

export function structName(): TChildren {
  return "";
}

export function self(property?: TChildren): TChildren {
  if (property === void 0) {
    return v("self");
  }
  return [v("self"), ".", property];
}
