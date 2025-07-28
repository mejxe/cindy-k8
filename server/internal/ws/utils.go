package ws

import (
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
