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
func ReportedBody(player *models.Player, body *models.DeadBody) {
	message := map[string]any{
		"bodyOf":  body.Of.Id,
		"foundBy": player.Id,
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageFoundBody, message)
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

func Voted(from *models.Player, forWho *models.Player) {
	vote := models.GlobalRoom.GameState.CurrentVote
	if !from.Alive || !forWho.Alive || vote.CurrentlyVoting.Identity != from {
		return
	}
	singleVote := models.SingleVote{From: from, ForWho: forWho}
	vote.VoteChannel <- singleVote
	message := map[string]any{
		"from": from.Id,
		"for":  forWho.Id,
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteReceived, message)

}
func SummarizeVote(eliminated *models.Player, voteAmount int) {
	if !eliminated.Alive {
		return
	}
	message := map[string]any{
		"eliminated":    eliminated.Id,
		"amountOfVotes": voteAmount,
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteSummary, message)
}
func SendState(to *models.Player) {

	roomData := map[string]any{
		"players":   models.GlobalRoom.Players.Map(),
		"gameState": models.GlobalRoom.GameState.Map(),
	}

	json.NewEncoder(to.Connection).Encode(roomData)
}
func StartGame() {
	if models.GlobalRoom.GameState.Started {
		return
	}
	models.GlobalRoom.StartGame()
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageStart, nil)
}
func EndGame() {
	if !models.GlobalRoom.GameState.Started {
		return
	}
	var summary map[string]any = nil    // TODO: Add game summary and send to players
	models.GlobalRoom.FinishGame(false) // TODO: Change that
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageEnd, summary)
}
