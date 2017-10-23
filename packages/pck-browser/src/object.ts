import { Serializable } from "./interface";
import { Writer } from "./writer";

export function writeObject<T extends Serializable>(w: Writer, v: T): void {
  v.pck(w);
}

export function writeTaggedObject<T extends Serializable>(w: Writer, v: T): void {
  v.pck(w, true);
}
