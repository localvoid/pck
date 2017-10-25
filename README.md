PCK is a binary format and a set of tools specifically designed for generating efficient serializers and deserializers
in javascript.

## Current Status

**WORK IN PROGRESS**

## Packages

- `pck` Core data structures and helper functions for generating schemas.
- `pck-emit-js` Emitter for Javascript/TypeScript (Browser/Node).
- `pck-emit-go` Emitter for Go.
- `pck-browser` Helper utilities for Javascript (Browser).
- `pck-node` Helper utilities for Javascript (Node).

## Features

- Javascript API for generating schemas (custom data query languages)
- Binary format
- Compact storage size
- Efficient serialization and deserialization in javascript
- Compact javascript serializers and deserializers that can immediately generate objects with appropriate types without
any additional steps

## Benchmarks

Basic benchmarks that encode and decode simple data structure:

```js
const DATA = {
  health: 100,
  jumping: true,
  position: { x: 10, y: 20 },
  attributes: { str: 100, agi: 50, int: 10 },
};
```

PCK schema:

```js
const Position = schema(ivar("x"), ivar("y"));
const Attributes = schema(u8("str"), u8("agi"), u8("int"));
const Player = schema(
  ivar("health"),
  bool("jumping"),
  ref("position", Position),
  ref("attributes", Attributes),
);
```

PCK storage size: 8 bytes

JSON storage size: 99 bytes

In real applications, JSON deserialization should be even slower because it usually requires additional transformation
step after `JSON.parse` invocation.

### Node v8.7.0 (i5 4570k, Linux)

```txt
pck:encode x 2,644,196 ops/sec ±0.97% (90 runs sampled)
pck:decode x 19,933,122 ops/sec ±0.36% (93 runs sampled)
json:encode x 493,391 ops/sec ±1.09% (93 runs sampled)
json:decode x 625,069 ops/sec ±0.41% (94 runs sampled)
```

### Browser (iPad 2017, iOS 11.0.3)

```txt
pck:encode x 1,154,161 ops/sec ±18.16% (24 runs sampled)
pck:decode x 28,425,812 ops/sec ±0.40% (64 runs sampled)
json:encode x 629,975 ops/sec ±0.76% (60 runs sampled)
json:decode x 617,485 ops/sec ±0.76% (60 runs sampled)
```

### Browser (Nexus 5, Chrome 61)

```txt
pck:encode x 384,855 ops/sec ±5.11% (54 runs sampled)
pck:decode x 3,066,241 ops/sec ±4.17% (48 runs sampled)
json:encode x 130,336 ops/sec ±3.17% (56 runs sampled)
json:decode x 126,887 ops/sec ±3.34% (54 runs sampled)
```

## Data Types

| Type         | Storage Size         | Description                       |
| ---          | ---                  | ---                               |
| Bool         | 1 bit (bit store)    | Boolean                           |
| I8           | 1 byte               | Int8                              |
| U8           | 1 byte               | Uint8                             |
| I16          | 2 bytes              | Int16                             |
| U16          | 2 bytes              | Uint16                            |
| I32          | 4 bytes              | Int32                             |
| U32          | 4 bytes              | Uint32                            |
| F32          | 4 bytes              | Float32                           |
| F64          | 8 bytes              | Float64                           |
| IVAR         | 1-5 bytes            | Variadic Int32 (ZigZag encoding)  |
| UVAR         | 1-5 bytes            | Variadic Uint32                   |
| UTF8         | 1-5+N bytes          | UTF8 String                       |
| ASCII        | 1-5+N bytes          | ASCII String                      |
| BYTES        | 1-5+N bytes          | Byte Array                        |
| ARRAY        | 1-5+N bytes          | Array                             |
| MAP(K,V)     | 1-5+(NK+NV) bytes    | Map                               |
| ASCII(N)     | N bytes              | Fixed ASCII String                |
| BYTES(N)     | N bytes              | Fixed Byte Array                  |
| ARRAY(N)     | NV bytes             | Fixed Array                       |
| REF(T)       | size(T) bytes        | Reference to an Object            |
| UNION(T...)  | 1-5+size(...T) bytes | Tagged Union                      |

## Object Structure

```
struct {
  // bitSet is used to store flags for optional fields and boolean values
  bitSet?: u8[N];
  // Data
  ...data;
}
```
