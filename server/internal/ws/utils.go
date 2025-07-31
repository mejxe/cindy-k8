package ws

import (
	"crypto/md5"

	"github.com/mejxe/cindy-k8/internal/models"
)

func getIdentity(token string) *models.Player {
	// find identity based on provided user token
	for _, p := range players.Players {
		if p.Token == token {
			return p
		}
	}
	return nil
}
func VerifyGM(password string) bool {
	// true if password matches
	return md5.Sum([]byte(password)) == [16]byte(models.GlobalRoom.GameMaster.Password)
}
