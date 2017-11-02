const pck = require("pck-node");

// pck:assign({ "schema": "Item" })
// pck:emit("class")
class Item {
  constructor(
    by,
    descendants,
    id,
    kids,
    score,
    time,
    title,
    url,
  ) {
    this.by = by;
    this.descendants = descendants;
    this.id = id;
    this.kids = kids;
    this.score = score;
    this.time = time;
    this.title = title;
    this.url = url;
  }

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
}

/**
 * unpckItem is an automatically generated deserialization function.
 *
 * @param reader Read buffer.
 * @returns Deserialized object.
 */
function unpckItem(reader) {
  const bitSet0 = pck.readU8(reader);
  const time = pck.readU32(reader);
  const descendants = pck.readUVar(reader);
  const id = pck.readUVar(reader);
  const score = pck.readUVar(reader);
  const by = pck.readUtf8(reader);
  const title = pck.readUtf8(reader);
  const url = (bitSet0 & (1 << 1)) !== 0 ? pck.readUtf8(reader) : "";
  const kids = (bitSet0 & (1 << 0)) !== 0 ? pck.readArray(reader, pck.readUVar) : null;

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

// pck:assign({ "schema": "TopStories" })
// pck:emit("class")
class TopStories {
  constructor(
    items,
  ) {
    this.items = items;
  }

  /**
   * pck is an automatically generated serialization method.
   *
   * @param writer Writer object.
   */
  pck(writer) {
    pck.writeArray(writer, this.items, pck.writeObject);
  }
}

/**
 * unpckTopStories is an automatically generated deserialization function.
 *
 * @param reader Read buffer.
 * @returns Deserialized object.
 */
function unpckTopStories(reader) {
  const items = pck.readArray(reader, unpckItem);

  return new TopStories(
    items,
  );
}
// pck:end

module.exports = {
  Item,
  unpckItem,
  TopStories,
  unpckTopStories,
};
