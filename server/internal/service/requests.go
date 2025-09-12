package service

import (
	"strconv"

	"github.com/mejxe/cindy-k8/internal/logging"
	"github.com/mejxe/cindy-k8/internal/models"
)

// FLOW: Parse the ClientMessage from the request -> call response function with parsed parameters

// CLIENT
func HandleGetIdentity(msg models.ClientMessage) {
	to := msg.Author
	SendIdentity(to)

}
func HandleReportBody(msg models.ClientMessage) {
	// called when player reports a body, checks if the bodyData is correct
	bodyOf, ok := msg.Body["bodyOf"].(string)
	if !ok {
		logging.Error.Printf("Error: Error while parsing 'bodyOf'.")
		return
	}
	roundsBody := models.GlobalRoom.GameState.RoundsBody
	if bodyOf != strconv.Itoa(roundsBody.Of.Id) {
		logging.Error.Printf("Error: Incorrect request body.")
		return
	}
	ReportedBody(msg.Author, roundsBody)
}
func HandlePassMic(msg models.ClientMessage) {
	// called when player passes the microphone to the person
	from := msg.Author
	toID, err := strconv.Atoi(msg.Body["to"].(string))
	if err != nil {
		logging.Error.Printf("Error: Incorrect request body %s.", err.Error())
		return
	}
	toPlayer, ok := models.GlobalRoom.Players.Players[toID]
	if ok == false {
		logging.Error.Println("Error: Incorrect player id in HandlePassMic.")
		return
	}
	MicPassed(from, toPlayer)
}
func HandleEliminateVote(msg models.ClientMessage) {
	vote, ok := models.GlobalRoom.GameState.CurrentVote.(*models.SyndicateVote)
	if (!ok) || !vote.GetStarted() {
		logging.Error.Printf("HandleEliminateVote: The vote is not on.")
		return
	}
	// called when player wants to kill another player
	perpetrator := msg.Author
	votedID, ok := msg.Body["kill"].(float64)
	if !ok {
		logging.Error.Printf("HandleEliminateVote: Incorrect request body.")
		return
	}
	votedPlayer, ok := models.GlobalRoom.Players.Players[int(votedID)]
	if !ok {
		logging.Error.Println("Error: Incorrect player id in HandleEliminate.")
		return
	}
	VotedForElimination(perpetrator, votedPlayer)
}
func HandleVoteFirst(msg models.ClientMessage) {
	// called when player presses the vote first button
	if models.GlobalRoom.GameState.CurrentVote.GetType() != models.City {
		logging.Error.Printf("HandleVoteFirst: Incorrect vote type.")
		return
	}
	vote := models.GlobalRoom.GameState.CurrentVote.(*models.CityVote)

	if !vote.GetStarted() || vote.CurrentlyVoting != nil {
		// if the vote is not on or the player is already voting decline the request
		logging.Error.Println("HandleVoteFirst: Vote already started or there is someone currently voting")
		return
	}
	author := msg.Author
	VoteFirst(author)
}
func HandleVote(msg models.ClientMessage) {
	// called when player votes for another player in the round ending vote
	logging.Info.Println("Entered handle vote.")
	from := msg.Author
	forWhoID, ok := msg.Body["for"].(float64)
	if !ok {
		logging.Error.Println("Error: Incorrect request body.")
		return
	}
	forWho, ok := models.GlobalRoom.Players.Players[int(forWhoID)]
	if !ok {
		logging.Error.Println("Error: Incorrect player id in HandleVote.")
		return
	}
	Voted(from, forWho)
}
func HandleSendState(msg models.ClientMessage) {
	// called when player client requests state
	to := msg.Author
	SendState(to)
}
func HandleGetVoteInfo(msg models.ClientMessage) {
	to := msg.Author
	if models.GlobalRoom.GameState.CurrentVote.GetType() == models.Syndicate && !to.Syndicate {
		return
	}
	SendVoteInfo(to.Connection)
}

// GM

func HandleSendStateToEveryone() {
	SendStateToEveryone()
}

func HandleSendGMState() {
	if !models.GlobalRoom.GameMaster.Connected {
		return
	}
	SendGMState()
}
func HandleGMGetVoteInfo() {
	SendVoteInfo(models.GlobalRoom.GameMaster.Connection)
}
func HandleManipulate(msg models.GMMessage) {
	rawID, ok := msg.Body["playerID"]
	id := int(rawID.(float64))

	if !ok {
		logging.Error.Println("HandleManipulate: Incorrect id.")
		return
	}
	player, ok := models.GlobalRoom.Players.Players[id]
	if !ok {
		logging.Error.Println("HandleManipulate: Can't find player with such id.")
		return
	}
	rawAction, ok := msg.Body["action"].(string)
	if !ok {
		logging.Error.Println("HandleManipulate: Incorrect action")
		return
	}
	action := models.GMManipulateAction(rawAction)

	switch action {

	case models.Kick:
		KickPlayer(player)

	case models.Kill:
		if models.GlobalRoom.GameState.Started {
			KillPlayer(player)
		}
	}

}

func HandleVoteSummary(msg models.GMMessage) {
	// called when GM requests data to be summed (done automatically at the end of the vote)
	vote := models.GlobalRoom.GameState.CurrentVote
	eliminated, voteAmount := vote.Finish()
	SummarizeVote(eliminated, voteAmount)
}
func HandleStartGame() {
	// called when GM requests the game to start
	StartGame()
}
func HandleEndVote() {
	if !models.GlobalRoom.GameState.Started || !models.GlobalRoom.GameState.CurrentVote.GetStarted() {
		logging.Error.Println("HandleEndVote: Game or vote is not on.")
		return
	}
	logging.Info.Println("In HandleEndVote")
	EndVote()

}
func HandleEndGame(msg models.GMMessage) {
	// called automatically when the game ends / or by gm to end the game early
	if models.GlobalRoom.GameState.Started {
		EndGame(msg)
	}
}
func HandleNextRound() {
	// start the next round
	NextRound()
}
func HandleShiftTime() {
	// cycle through night and day
	ShiftTime()
}
func HandleStartVote() {
	if models.GlobalRoom.GameState.CurrentVote.GetStarted() {
		logging.Error.Println("HandleStartVote: Vote is already started.")
		return
	}
	StartVote()
}
