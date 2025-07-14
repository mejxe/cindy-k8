package handlers

import (
	"crypto/rand"
	"github.com/mejxe/cindy-k8/internal/models"
	"math/big"
)

func getIdentity(token string) *models.Player {
	for _, p := range players.Players {
		if p.Token == token {
			return &p
		}
	}
	return nil
}
func generateToken() string {
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
