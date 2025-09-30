package service

import (
	"encoding/json"
	"time"

	"github.com/mejxe/cindy-k8/internal/logging"
	"github.com/mejxe/cindy-k8/internal/models"
	"golang.org/x/net/websocket"
)

// FLOW: (Modify state/Pass data to modify state) and notify user client(s)

func SendIdentity(to *models.Player) {
	json.NewEncoder(to.Connection).
		Encode(models.NewServerMessage(models.ServerMessageIdentity, to.UpgradeMap(to.Map())))
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
func VoteFirst(firstVoter *models.Player) {
	// only applicable to City Vote
	logging.Info.Println("entered votefirst")
	vote := models.GlobalRoom.GameState.CurrentVote.(*models.CityVote)
	vote.CreateVotersList(firstVoter)
	msg := vote.Map()
	logging.Info.Println("will send: ", msg)
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteUpdate, msg)
	go vote.Start()
}

func Voted(from *models.Player, forWho *models.Player) {
	// called when player voted
	vote := models.GlobalRoom.GameState.CurrentVote
	if !from.Alive || !forWho.Alive {
		return
	}
	logging.Info.Println("Voted: Parsing a vote and sending it through vote channel!")
	singleVote := models.SingleVote{From: from, ForWho: forWho}
	vote.GetChannel() <- singleVote
	message := map[string]any{
		"from": from.Id,
		"for":  forWho.Id,
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteReceived, message)
}

func VotedForElimination(syndicate *models.Player, citizen *models.Player) {
	// called when player is killed by syndicate
	if !syndicate.Syndicate || citizen.Syndicate || !citizen.Alive {
		return
	}
	vote := models.GlobalRoom.GameState.CurrentVote
	logging.Info.Println("Voted: Parsing a vote and sending it through vote channel!")
	singleVote := models.SingleVote{From: syndicate, ForWho: citizen}
	vote.GetChannel() <- singleVote
	message := map[string]any{
		"from": syndicate.Id,
		"for":  citizen.Id,
	}
	// TODO: Send the message only to syndicate \\ add a type to the vote maybe and send it based on that?
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteReceived, message)
	//citizen.Alive = false
	//message := map[string]any{
	//	"whoDied": citizen.Id,
	//}
	//models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessagePKilled, message)
}

func SummarizeVote(eliminated []*models.Player, voteAmount int) {
	// called when vote ends
	models.GlobalRoom.Players.Lock()
	elimIds := make([]int, 0)
	for _, elim := range eliminated {
		if !elim.Alive {
			continue
		}
		elimIds = append(elimIds, elim.Id)
		if len(eliminated) == 1 {
			elim.Alive = false
			logging.Info.Printf("SummarizeVote: %s %s was eliminated.\n", elim.FirstName, elim.LastName)
		}
	}
	message := map[string]any{
		"eliminated":    elimIds,
		"amountOfVotes": voteAmount,
	}
	models.GlobalRoom.Players.Unlock()
	models.GlobalRoom.GMInChannel <- models.NewGMMessage(models.GMMessageShiftTime, nil)
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteSummary, message)
}
func SendState(to *models.Player) {
	// called when user requested state

	var state map[string]any
	if to.Syndicate {
		state = models.GlobalRoom.GetStateGM()
	} else {
		state = models.GlobalRoom.GetState()
	}

	json.NewEncoder(to.Connection).Encode(models.NewServerMessage(models.ServerMessageSendState, state))
	logging.Info.Printf("SendState: Sending state to %s %s\n", to.FirstName, to.LastName)
}
func SendVoteInfo(to *websocket.Conn) {
	json.NewEncoder(to).
		Encode(models.NewServerMessage(models.ServerMessageVoteUpdate, models.GlobalRoom.GameState.CurrentVote.Map()))
	logging.Info.Printf("SendVoteInfo: Sending vote info!")
}

// Sends game state to every connected client
func SendStateToEveryone() {
	models.GlobalRoom.OutChannel <- models.CreateStateMessage()
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
	models.GlobalRoom.StartGame()
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageStart, nil)
}
func EndGame(msg models.GMMessage) {
	if !models.GlobalRoom.GameState.Started {
		return
	}
	var summary models.GameSummary
	if syndicateWins, ok := msg.Body["syndicateWins"]; ok {
		summary = models.GlobalRoom.GameState.FinishGame(syndicateWins.(bool))
	} else {
		models.GlobalRoom.GameState.FinishGame(false) // default when the game is ended early
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageEnd, summary.Map())
	time.Sleep(100 * time.Millisecond)
	models.GlobalRoom.CloseConnections()
	models.GlobalRoom.GMInChannel <- models.NewGMMessage(models.GMMessageSendState, nil)
}
func NextRound() {
	if !models.GlobalRoom.GameState.Started {
		return
	}
	models.GlobalRoom.GameState.NextRound()
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageNextRound, nil)
	SendStateToEveryone()

}
func ShiftTime() {
	if !models.GlobalRoom.GameState.Started {
		return
	}
	if models.GlobalRoom.GameState.CurrentVote.GetStarted() {
		models.GlobalRoom.GameState.CurrentVote.End()
		models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteUpdate,
			models.GlobalRoom.GameState.CurrentVote.Map())
	}

	if models.GlobalRoom.GameState.Night {
		models.GlobalRoom.GameState.NextRound()
		models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageNextRound, nil)
	} else {
		models.GlobalRoom.GameState.NextTime()
		models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageNightStarted, nil)
	}
	SendStateToEveryone()
}
func KickPlayer(player *models.Player) {
	models.GlobalRoom.Players.Lock()
	defer models.GlobalRoom.Players.Unlock()

	message := map[string]any{
		"who": player.Id,
	}

	json.NewEncoder(player.Connection).Encode(models.NewServerMessage(models.ServerMessageKicked, message))

	player.Connection.Close()
	delete(models.GlobalRoom.Players.Players, player.Id)

	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageKicked, message)
}
func KillPlayer(player *models.Player) {
	models.GlobalRoom.Players.Lock()

	player.Alive = false
	message := map[string]any{
		"whoDied": player.Id,
	}
	models.GlobalRoom.Players.Unlock()

	logging.Success.Println("Killed a player!")

	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessagePKilled, message)
}
func StartVote() {
	vote := models.GlobalRoom.GameState.CurrentVote
	vote.Init()
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteStarted, nil)
}
func EndVote() {
	logging.Info.Println("In EndVote")
	vote := models.GlobalRoom.GameState.CurrentVote
	vote.End()
	message := map[string]any{
		"eliminated":    nil,
		"amountOfVotes": 0,
	}
	logging.Success.Println("EndVote: Vote aborted succesfully!")
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessageVoteSummary, message)
}
