export interface PckBuffer {
  readonly u: Uint8Array;
  o: number;
}

export function createPckBuffer(a: ArrayBuffer): PckBuffer {
  return { u: new Uint8Array(a), o: 0 };
}
