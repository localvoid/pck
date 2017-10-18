import { Writer } from "./writer";

export interface Serializable {
  pck(w: Writer, tag?: boolean): void;
}
