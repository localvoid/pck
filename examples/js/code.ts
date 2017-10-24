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
    // str: u8
    __pck.writeI8(__w, this.str);
    // agi: u8
    __pck.writeI8(__w, this.agi);
    // int: u8
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
  // Regular Fields:
  // str: u8
  const str = __pck.readU8(__r);
  // agi: u8
  const agi = __pck.readU8(__r);
  // int: u8
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
  items: number[] | null;
  attributes: Attributes;

  constructor(name: string, age: number, jumping: boolean, items: number[] | null, attributes: Attributes) {
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
      // Optional Fields:
      (((this.items) !== null) && ((this.items).length > 0)), /* items: omitEmpty(optional(array)) */
      // Boolean Fields:
      ((this.jumping) === true), /* jumping: bool */
    );
    // name: utf8
    __pck.writeUtf8(__w, this.name);
    // age: u8
    __pck.writeI8(__w, this.age);
    // items: omitEmpty(optional(array))
    if (((this.items) !== null) && ((this.items).length > 0)) {
      __pck.writeArray(__w, this.items, __pck.writeI32);
    }
    // attributes: ref[Attributes]
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
  // BitSet:
  const __bitSet0 = __pck.readU8(__r);

  // Boolean Fields:
  // jumping: bool
  const jumping = (__bitSet0 & (1 << 1)) !== 0;
  // Regular Fields:
  // name: utf8
  const name = __pck.readUtf8(__r);
  // age: u8
  const age = __pck.readU8(__r);
  // items: omitEmpty(optional(array))
  const items = (__bitSet0 & (1 << 0)) !== 0 ? __pck.readArray(__r, __pck.readU32) : null;
  // attributes: ref[Attributes]
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
