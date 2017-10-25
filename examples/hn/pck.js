const __pck = require("pck-node");

// pck:assign({ "schema": "Item" })
class Item {
  constructor(by, descendants, id, kids, score, time, title, url) {
    this.by = by;
    this.descendants = descendants;
    this.id = id;
    this.kids = kids;
    this.score = score;
    this.time = time;
    this.title = title;
    this.url = url;
  }

  // pck:emit("pck")
  /**
   * pck is an automatically generated serialization method.
   *
   * @param __w Writer object.
   */
  pck(__w) {
    __pck.writeBitSet(
      __w,
      // Optional Fields:
      ((this.kids) !== null), /* kids: optional(array) */
    );
    // by: utf8
    __pck.writeUtf8(__w, this.by);
    // descendants: uvar
    __pck.writeUVar(__w, this.descendants);
    // id: uvar
    __pck.writeUVar(__w, this.id);
    // kids: optional(array)
    if ((this.kids) !== null) {
      __pck.writeArray(__w, this.kids, __pck.writeUVar);
    }
    // score: uvar
    __pck.writeUVar(__w, this.score);
    // time: u32
    __pck.writeI32(__w, this.time);
    // title: utf8
    __pck.writeUtf8(__w, this.title);
    // url: utf8
    __pck.writeUtf8(__w, this.url);
  }
  // pck:end
}

// pck:emit("unpck")
/**
 * unpckItem is an automatically generated deserialization function.
 *
 * @param __r Read buffer.
 * @returns Deserialized object.
 */
function unpckItem(__r) {
  // BitSet:
  const __bitSet0 = __pck.readU8(__r);

  // Regular Fields:
  // by: utf8
  const by = __pck.readUtf8(__r);
  // descendants: uvar
  const descendants = __pck.readUVar(__r);
  // id: uvar
  const id = __pck.readUVar(__r);
  // kids: optional(array)
  const kids = (__bitSet0 & (1 << 0)) !== 0 ? __pck.readArray(__r, __pck.readUVar) : null;
  // score: uvar
  const score = __pck.readUVar(__r);
  // time: u32
  const time = __pck.readU32(__r);
  // title: utf8
  const title = __pck.readUtf8(__r);
  // url: utf8
  const url = __pck.readUtf8(__r);

  return new Item(
    by,
    descendants,
    id,
    kids,
    score,
    time,
    title,
    url,
  );
}
// pck:end

module.exports = {
  Item,
  unpckItem,
};
