package basic

// Position is position
type Position struct {
	X int64 `json:"x"`
	Y int64 `json:"y"`
}

// Attributes is attributes
type Attributes struct {
	Str uint8 `json:"str"`
	Agi uint8 `json:"agi"`
	Int uint8 `json:"int"`
}

// User is user
type User struct {
	Health     int64      `json:"health"`
	Jumping    bool       `json:"jumping"`
	Position   Position   `json:"position"`
	Attributes Attributes `json:"attributes"`
}

// pck:emit("taggedFactories")

var taggedFactories = [0]func() unpcker{}

// pck:end

// pck:emit("methods", "Position")

// PckSize is an automatically generated method for PCK serialized size calculation.
func (position *Position) PckSize() (size int) {
	var length int
	_ = length
	size = 0
	size += sizeIvar(int64(position.X))
	size += sizeIvar(int64(position.Y))
	return
}

// PckTagSize is an automatically generated method for PCK serialized size calculation.
func (position *Position) PckTagSize() int {
	return 0
}

// PckTag is an automatically generated method for PCK serialization.
func (position *Position) PckTag(b []byte) int {
	return 0
}

// Pck is an automatically generated method for PCK serialization.
func (position *Position) Pck(b []byte) int {
	offset := 0
	offset += writeIvar(b[offset:], int64(position.X))
	offset += writeIvar(b[offset:], int64(position.Y))
	return offset
}

// Unpck is an automatically generated method for PCK deserialization.
func (position *Position) Unpck(b []byte) int {
	offset := 0
	{
		value, size := readIvar(b[offset:])
		position.X = value
		offset += size
	}
	{
		value, size := readIvar(b[offset:])
		position.Y = value
		offset += size
	}
	return offset
}

// pck:end

// pck:emit("methods", "Attributes")

// PckSize is an automatically generated method for PCK serialized size calculation.
func (attributes *Attributes) PckSize() int {
	return 3
}

// PckTagSize is an automatically generated method for PCK serialized size calculation.
func (attributes *Attributes) PckTagSize() int {
	return 0
}

// PckTag is an automatically generated method for PCK serialization.
func (attributes *Attributes) PckTag(b []byte) int {
	return 0
}

// Pck is an automatically generated method for PCK serialization.
func (attributes *Attributes) Pck(b []byte) int {
	_ = b[2]
	b[0] = byte(attributes.Str)
	b[1] = byte(attributes.Agi)
	b[2] = byte(attributes.Int)
	return 3
}

// Unpck is an automatically generated method for PCK deserialization.
func (attributes *Attributes) Unpck(b []byte) int {
	_ = b[2]
	attributes.Str = uint8(b[0])
	attributes.Agi = uint8(b[1])
	attributes.Int = uint8(b[2])
	return 3
}

// pck:end

// pck:emit("methods", "User")

// PckSize is an automatically generated method for PCK serialized size calculation.
func (user *User) PckSize() (size int) {
	var length int
	_ = length
	size = 4
	size += sizeIvar(int64(user.Health))
	size += user.Position.PckSize()
	return
}

// PckTagSize is an automatically generated method for PCK serialized size calculation.
func (user *User) PckTagSize() int {
	return 0
}

// PckTag is an automatically generated method for PCK serialization.
func (user *User) PckTag(b []byte) int {
	return 0
}

// Pck is an automatically generated method for PCK serialization.
func (user *User) Pck(b []byte) int {
	_ = b[3]
	if user.Jumping {
		b[0] = 1
	}
	user.Attributes.Pck(b[1:])
	offset := 4
	offset += writeIvar(b[offset:], int64(user.Health))
	offset += user.Position.Pck(b[offset:])
	return offset
}

// Unpck is an automatically generated method for PCK deserialization.
func (user *User) Unpck(b []byte) int {
	_ = b[3]
	bitSet0 := b[0]
	user.Jumping = bitSet0 != 0
	user.Attributes.Unpck(b[1:])
	offset := 4
	{
		value, size := readIvar(b[offset:])
		user.Health = value
		offset += size
	}
	offset += user.Position.Unpck(b[offset:])
	return offset
}

// pck:end

// pck:emit("lib")

type unpcker interface {
	Unpck(b []byte) int
}

func writeUint16(b []byte, v uint16) {
	_ = b[1]
	b[0] = byte(v)
	b[1] = byte(v >> 8)
}

func readUint16(b []byte) uint16 {
	_ = b[1]
	return uint16(b[0]) | uint16(b[1])<<8
}

func writeUint32(b []byte, v uint32) {
	_ = b[3]
	b[0] = byte(v)
	b[1] = byte(v >> 8)
	b[2] = byte(v >> 16)
	b[3] = byte(v >> 24)
}

func readUint32(b []byte) uint32 {
	_ = b[3]
	return uint32(b[0]) | uint32(b[1])<<8 | uint32(b[2])<<16 | uint32(b[3])<<24
}

func writeUint64(b []byte, v uint64) {
	_ = b[7]
	b[0] = byte(v)
	b[1] = byte(v >> 8)
	b[2] = byte(v >> 16)
	b[3] = byte(v >> 24)
	b[4] = byte(v >> 32)
	b[5] = byte(v >> 40)
	b[6] = byte(v >> 48)
	b[7] = byte(v >> 56)
}

func readUint64(b []byte) uint64 {
	_ = b[7]
	return uint64(b[0]) | uint64(b[1])<<8 | uint64(b[2])<<16 | uint64(b[3])<<24 |
		uint64(b[4])<<32 | uint64(b[5])<<40 | uint64(b[6])<<48 | uint64(b[7])<<56
}

func writeUvar(b []byte, v uint64) int {
	i := 0
	for v >= 0x80 {
		b[i] = byte(v) | 0x80
		v >>= 7
		i++
	}
	b[i] = byte(v)
	return i + 1
}

func readUvar(b []byte) (v uint64, i int) {
	for shift := uint(0); ; shift += 7 {
		x := b[i]
		i++
		v |= (uint64(x) & 0x7F) << shift
		if x < 0x80 {
			return
		}
	}
}

func writeIvar(b []byte, v int64) int {
	uv := uint64(v) << 1
	if v < 0 {
		uv ^= uv
	}
	return writeUvar(b, uv)
}

func readIvar(b []byte) (int64, int) {
	uv, i := readUvar(b)
	v := int64(uv >> 1)
	if uv&1 != 0 {
		v = ^v
	}
	return v, i
}

func sizeUvar(v uint64) (n int) {
	for {
		n++
		v >>= 7
		if v == 0 {
			return
		}
	}
}

func sizeIvar(v int64) int {
	uv := uint64(v) << 1
	if v < 0 {
		uv ^= uv
	}
	return sizeUvar(uv)
}

// pck:end
