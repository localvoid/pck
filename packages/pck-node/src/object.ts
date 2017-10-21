import { Serializable } from "./interface";
import { Writer } from "./writer";

export function objectWriter<T extends Serializable>(w: Writer, v: T): void {
  v.pck(w);
}

export function objectTaggedWriter<T extends Serializable>(w: Writer, v: T): void {
  v.pck(w, true);
}
