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
      (((this.kids) !== null) && ((this.kids).length > 0)),
      ((this.url) !== ""),
    );
    __pck.writeUtf8(__w, this.by);
    __pck.writeUVar(__w, this.descendants);
    __pck.writeUVar(__w, this.id);
    if (((this.kids) !== null) && ((this.kids).length > 0)) {
      __pck.writeArray(__w, this.kids, __pck.writeUVar);
    }
    __pck.writeUVar(__w, this.score);
    __pck.writeI32(__w, this.time);
    __pck.writeUtf8(__w, this.title);
    if ((this.url) !== "") {
      __pck.writeUtf8(__w, this.url);
    }
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
  const __bitSet0 = __pck.readU8(__r);

  const by = __pck.readUtf8(__r);
  const descendants = __pck.readUVar(__r);
  const id = __pck.readUVar(__r);
  const kids = (__bitSet0 & (1 << 0)) !== 0 ? __pck.readArray(__r, __pck.readUVar) : null;
  const score = __pck.readUVar(__r);
  const time = __pck.readU32(__r);
  const title = __pck.readUtf8(__r);
  const url = (__bitSet0 & (1 << 1)) !== 0 ? __pck.readUtf8(__r) : "";

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
