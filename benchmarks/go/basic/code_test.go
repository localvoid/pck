package basic

import "testing"
import "encoding/json"
import "fmt"

var Data = &User{
	Health:  100,
	Jumping: true,
	Position: Position{
		X: 10,
		Y: 20,
	},
	Attributes: Attributes{
		Str: 100,
		Agi: 50,
		Int: 10,
	},
}
var PckRaw = pckEncode()
var JSONRaw = jsonEncode()

func init() {
	fmt.Printf("%s\n", JSONRaw)
}

func pckEncode() (buf []byte) {
	buf = make([]byte, Data.Size())
	Data.Pck(buf)
	return
}

func pckDecode() *User {
	u := &User{}
	u.Unpck(PckRaw)
	return u
}

func jsonEncode() (buf []byte) {
	buf, _ = json.Marshal(Data)
	return
}

func jsonDecode() *User {
	u := &User{}
	json.Unmarshal(JSONRaw, u)
	return u
}

func BenchmarkPckEncode(b *testing.B) {
	for n := 0; n < b.N; n++ {
		pckEncode()
	}
}

func BenchmarkPckDecode(b *testing.B) {
	for n := 0; n < b.N; n++ {
		pckDecode()
	}
}

func BenchmarkJsonEncode(b *testing.B) {
	for n := 0; n < b.N; n++ {
		jsonEncode()
	}
}

func BenchmarkJsonDecode(b *testing.B) {
	for n := 0; n < b.N; n++ {
		jsonDecode()
	}
}
