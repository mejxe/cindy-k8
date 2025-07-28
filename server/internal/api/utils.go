package api

import (
	"crypto/rand"
	"math/big"
)

func generateToken() string {
	// generate token for verification of the connection (user creates a character -> gets a token -> verifies himself on ws)
	var token string = ""
	r := rand.Reader
	for range 5 {
		start := int64('A')
		stop := int64('z')
		rLet, _ := rand.Int(r, big.NewInt(stop))
		token += string(rune(start + (rLet.Int64() % (stop - start))))
	}
	return token
}
