export const enum WriteNodeFlags {
  Int = 1,
  Float = 1 << 1,
  VarInt = 1 << 2,
  BitSet = 1 << 3,

  UTF8 = 1 << 4,
  ASCII = 1 << 5,
  Bytes = 1 << 6,

  Signed = 1 << 7,
}

export class WriteNode<T = any> {
  readonly flags: WriteNodeFlags;
  readonly size: number;
  readonly value: T;
  next: WriteNode | null;

  constructor(flags: WriteNodeFlags, size: number, value: T) {
    this.flags = flags;
    this.size = size;
    this.value = value;
    this.next = null;
  }
}

export class Writer {
  readonly first: WriteNode;
  last: WriteNode;
  size: number;

  constructor() {
    const n = new WriteNode(0, 0, null);
    this.first = n;
    this.last = n;
    this.size = 0;
  }
}

export function pushWriteNode(w: Writer, n: WriteNode): void {
  w.last.next = n;
  w.last = n;
  w.size += n.size;
}
