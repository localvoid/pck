package hn

import (
	"encoding/json"
	"io/ioutil"
	"testing"
)

var Data *TopStories
var PckRaw []byte
var JSONRaw []byte

func init() {
	d, _ := ioutil.ReadFile("../../../examples/hn/data/top_stories.json")

	Data = &TopStories{}
	json.Unmarshal(d, Data)

	PckRaw = pckEncode()
	JSONRaw = jsonEncode()
}

func pckEncode() (buf []byte) {
	buf = make([]byte, Data.PckSize())
	Data.Pck(buf)
	return
}

func pckDecode() *TopStories {
	u := &TopStories{}
	u.Unpck(PckRaw)
	return u
}

func jsonEncode() (buf []byte) {
	buf, _ = json.Marshal(Data)
	return
}

func jsonDecode() *TopStories {
	u := &TopStories{}
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
