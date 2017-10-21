`pck` is a binary format specifically designed for generating efficient serializers and deserializers in javascript.

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

## Data Types

| Type         | Storage Size        | Description                       |
| ---          | ---                 | ---                               |
| Bool         | 1 bit (bit store)   | Boolean                           |
| I8           | 1 byte              | Int8                              |
| U8           | 1 byte              | Uint8                             |
| I16          | 2 bytes             | Int16                             |
| U16          | 2 bytes             | Uint16                            |
| I32          | 4 bytes             | Int32                             |
| U32          | 4 bytes             | Uint32                            |
| F32          | 4 bytes             | Float32                           |
| F64          | 8 bytes             | Float64                           |
| IVAR         | 1-5 bytes           | Variadic Int32 (ZigZag encoding)  |
| UVAR         | 1-5 bytes           | Variadic Uint32                   |
| UTF8         | 1-5+N bytes         | UTF8 String                       |
| ASCII        | 1-5+N bytes         | ASCII String                      |
| BYTES        | 1-5+N bytes         | Byte Array                        |
| ARRAY        | 1-5+N bytes         | Array                             |
| MAP(K,V)     | 1-5+(N*K+N*V) bytes | Map                               |
| ASCII(N)     | N bytes             | Fixed ASCII String                |
| BYTES(N)     | N bytes             | Fixed Byte Array                  |
| ARRAY(N)     | N*V bytes           | Fixed Array                       |
| REF(T)       | size(T) bytes       | Reference to an Object            |
| ONE_OF(T...) | 1-5+size(T) bytes   | One of types                      |

## Object Structure

```
struct {
  // bitSet is used to store flags for optional fields and boolean values
  bitSet?: u8[N];
  // Data
  ...data;
}
```
