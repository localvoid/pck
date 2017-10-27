const pck = require("pck-node");

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
   * @param writer Writer object.
   */
  pck(writer) {
    const optionalKids = (((this.kids) !== null) && ((this.kids).length > 0));
    const optionalUrl = ((this.url) !== "");
    pck.writeBitSet(
      writer,
      optionalKids,
      optionalUrl,
    );
    pck.writeI32(writer, this.time);
    pck.writeUVar(writer, this.descendants);
    pck.writeUVar(writer, this.id);
    pck.writeUVar(writer, this.score);
    pck.writeUtf8(writer, this.by);
    pck.writeUtf8(writer, this.title);
    if (optionalUrl) {
      pck.writeUtf8(writer, this.url);
    }
    if (optionalKids) {
      pck.writeArray(writer, this.kids, pck.writeUVar);
    }
  }
  // pck:end
}

// pck:emit("unpck")
/**
 * unpckItem is an automatically generated deserialization function.
 *
 * @param reader Read buffer.
 * @returns Deserialized object.
 */
function unpckItem(reader) {
  const __bitSet0 = pck.readU8(reader);
  const time = pck.readU32(reader);
  const descendants = pck.readUVar(reader);
  const id = pck.readUVar(reader);
  const score = pck.readUVar(reader);
  const by = pck.readUtf8(reader);
  const title = pck.readUtf8(reader);
  const url = (__bitSet0 & (1 << 1)) !== 0 ? pck.readUtf8(reader) : "";
  const kids = (__bitSet0 & (1 << 0)) !== 0 ? pck.readArray(reader, pck.readUVar) : null;

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
