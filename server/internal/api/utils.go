package api

import (
	"crypto/md5"
	"crypto/rand"
	"math/big"
	"os"
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
func generateGMHashAndSave(password string) (ok bool, err error) {
	// for persistent password on host machine TODO: add it eventually
	ok = true
	hashed := md5.Sum([]byte(password))
	err = os.WriteFile("../../tmp/password", hashed[:], 0644)
	if err != nil {
		return !ok, err
	}
	return ok, nil
}
