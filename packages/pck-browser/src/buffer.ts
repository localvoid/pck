export interface WriteBuffer {
  /**
   * Data buffer.
   */
  readonly u: Uint8Array;
  /**
   * Cache is used to store precomputed sizes.
   */
  readonly c: number[];
  o: number; // buffer offset
  i: number; // cache offset
}

export interface ReadBuffer {
  readonly u: Uint8Array;
  o: number;
}
