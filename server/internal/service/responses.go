package service

import (
	"encoding/json"

	"github.com/mejxe/cindy-k8/internal/models"
)

// FLOW: (Modify state/Pass data to modify state) and notify user client(s)

func Eliminated(syndicate *models.Player, citizen *models.Player) {
	// called when player is killed by syndicate
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
	// called when player found a body, notifies only the player
	message := map[string]any{
		"bodyOf":   body.Of.Id,
		"killedBy": body.KilledBy,
	}
	json.NewEncoder(player.Connection).Encode(models.NewServerMessage(models.ServerMessageFoundBody, message))
}
func ReportedBody(player *models.Player, body *models.DeadBody) {
	// called when player reported the body he found to everyone
	message := map[string]any{
		"bodyOf":  body.Of.Id,
		"foundBy": player.Id,
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageFoundBody, message)
}
func MicPassed(from *models.Player, to *models.Player) {
	// called when player passed the mic to another player
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
	// called when player voted
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
	// called when vote ends
	if !eliminated.Alive {
		return
	}
	eliminated.Alive = false
	message := map[string]any{
		"eliminated":    eliminated.Id,
		"amountOfVotes": voteAmount,
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteSummary, message)
}
func SendState(to *models.Player) {
	// called when user requested state
	json.NewEncoder(to.Connection).Encode(models.NewServerMessage(models.ServerMessageSendState,
		models.GlobalRoom.GetState()))
}

func SendStateToEveryone() {
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageSendState,
		models.GlobalRoom.GetState())
}

// GM

func SendGMState() {
	json.NewEncoder(models.GlobalRoom.GameMaster.Connection).
		Encode(models.NewServerMessage(models.ServerMessageSendState, models.GlobalRoom.GetStateGM()))
}

func StartGame() {
	if models.GlobalRoom.GameState.Started {
		return
	}
	models.GlobalRoom.GameState.StartGame()
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageStart, nil)
}
func EndGame() {
	if !models.GlobalRoom.GameState.Started {
		return
	}
	var summary map[string]any = nil              // TODO: Add game summary and send to players
	models.GlobalRoom.GameState.FinishGame(false) // TODO: Change that
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageEnd, summary)
}
func NextRound() {
	if !models.GlobalRoom.GameState.Started {
		return
	}
	if models.GlobalRoom.GameState.Night {
		models.GlobalRoom.GameState.NextRound()
		models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageNextRound, nil)
	} else {
		models.GlobalRoom.GameState.NextNight()
		models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageNightStarted, nil)
	}

}
