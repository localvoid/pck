import * as __pck from "pck-browser";

// pck:assign({"schema": "Attributes"})
export class Attributes implements __pck.Serializable {
  str: number;
  agi: number;
  int: number;

  constructor(str: number, agi: number, int: number) {
    this.str = str;
    this.agi = agi;
    this.int = int;
  }

  // pck:emit("pck")
  /**
   * pck is an automatically generated serialization method.
   *
   * @param __w Writer object.
   */
  pck(__w: __pck.Writer): void {
    __pck.writeI8(__w, this.str);
    __pck.writeI8(__w, this.agi);
    __pck.writeI8(__w, this.int);
  }
  // pck:end
}

// pck:emit("unpck")
/**
 * unpckAttributes is an automatically generated deserialization function.
 *
 * @param __r Read buffer.
 * @returns Deserialized object.
 */
export function unpckAttributes(__r: __pck.ReadBuffer): Attributes {
  const str = __pck.readU8(__r);
  const agi = __pck.readU8(__r);
  const int = __pck.readU8(__r);

  return new Attributes(
    str,
    agi,
    int,
  );
}
// pck:end

// pck:assign({"schema": "User"})
export class User implements __pck.Serializable {
  name: string;
  age: number;
  jumping: boolean;
  items: number[];
  attributes: Attributes;

  constructor(name: string, age: number, jumping: boolean, items: number[], attributes: Attributes) {
    this.name = name;
    this.age = age;
    this.jumping = jumping;
    this.items = items;
    this.attributes = attributes;
  }

  // pck:emit("pck")
  /**
   * pck is an automatically generated serialization method.
   *
   * @param __w Writer object.
   */
  pck(__w: __pck.Writer): void {
    __pck.writeBitSet(
      __w,
      ((this.items).length > 0),
      ((this.jumping) === true),
    );
    __pck.writeUtf8(__w, this.name);
    __pck.writeI8(__w, this.age);
    if ((this.items).length > 0) {
      __pck.writeArray(__w, this.items, __pck.writeI32);
    }
    this.attributes.pck(__w);
  }
  // pck:end
}

// pck:emit("unpck")
/**
 * unpckUser is an automatically generated deserialization function.
 *
 * @param __r Read buffer.
 * @returns Deserialized object.
 */
export function unpckUser(__r: __pck.ReadBuffer): User {
  const __bitSet0 = __pck.readU8(__r);

  const jumping = (__bitSet0 & (1 << 1)) !== 0;
  const name = __pck.readUtf8(__r);
  const age = __pck.readU8(__r);
  const items = (__bitSet0 & (1 << 0)) !== 0 ? __pck.readArray(__r, __pck.readU32) : [];
  const attributes = unpckAttributes(__r);

  return new User(
    name,
    age,
    jumping,
    items,
    attributes,
  );
}
// pck:end
