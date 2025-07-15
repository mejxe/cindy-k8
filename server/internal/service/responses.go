package service

import (
	"encoding/json"

	"github.com/mejxe/cindy-k8/internal/models"
)

func Eliminated(syndicate *models.Player, citizen *models.Player) {
	if !syndicate.Syndicate || citizen.Syndicate || !citizen.Alive {
		return
	}
	citizen.Alive = false
	message := map[string]any{
		"whoDied": citizen.Id,
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessagePKilled, message)
}

func FoundBody(player *models.Player, body *models.DeadBody) {
	message := map[string]any{
		"bodyOf":   body.Of.Id,
		"killedBy": body.KilledBy,
	}
	json.NewEncoder(player.Connection).Encode(models.NewServerMessage(models.ServerMessageFoundBody, message))
}
func MicPassed(from *models.Player, to *models.Player) {
	if models.GlobalRoom.GameState.HoldingMic != from {
		return
	}
	models.GlobalRoom.GameState.HoldingMic = to
	message := map[string]any{
		"from": from.Id,
		"to":   to.Id,
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageMicPassed, message)
}

func Vote() {} // TODO: Add voting system and something to hold votes

func Start() {
	if models.GlobalRoom.GameState.Started {
		return
	}
	models.GlobalRoom.GameState.Started = true
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageStart, nil)
}
func End() {
	if !models.GlobalRoom.GameState.Started {
		return
	}
	var summary map[string]any = nil // TODO: Add game summary and send to players
	models.GlobalRoom.GameState.Started = false
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageEnd, summary)
}
