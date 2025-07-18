package service

import (
	"fmt"
	"strconv"

	"github.com/mejxe/cindy-k8/internal/models"
)

// FLOW: Parse the ClientMessage from the request -> call response function with parsed parameters

func HandleReportBody(msg models.ClientMessage) {
	// called when player reports a body, checks if the bodyData is correct
	bodyOf, ok := msg.Body["bodyOf"].(string)
	if !ok {
		fmt.Printf("Error: Error while parsing 'bodyOf'.")
		return
	}
	roundsBody := models.GlobalRoom.GameState.RoundsBody
	if bodyOf != strconv.Itoa(roundsBody.Of.Id) {
		fmt.Printf("Error: Incorrect request body.")
		return
	}
	ReportedBody(msg.Author, roundsBody)
}
func HandlePassMic(msg models.ClientMessage) {
	// called when player passes the microphone to the person
	from := msg.Author
	toID, err := strconv.Atoi(msg.Body["to"].(string))
	if err != nil {
		fmt.Printf("Error: Incorrect request body %s.", err.Error())
		return
	}
	toPlayer, ok := models.GlobalRoom.Players.Players[toID]
	if ok == false {
		fmt.Println("Error: Incorrect player id in HandlePassMic.")
		return
	}
	MicPassed(from, toPlayer)
}
func HandleEliminate(msg models.ClientMessage) {
	// called when player wants to kill another player
	perpetrator := msg.Author // :)
	killedRaw := msg.Body["kill"].(string)
	killedID, err := strconv.Atoi(killedRaw)
	if err != nil {
		fmt.Printf("Error: Incorrect request body %s.", err.Error())
		return
	}
	killedPlayer, ok := models.GlobalRoom.Players.Players[killedID]
	if !ok {
		fmt.Println("Error: Incorrect player id in HandleEliminate.")
		return
	}
	Eliminated(perpetrator, killedPlayer)
}
func HandleVote(msg models.ClientMessage) {
	// called when player votes for another player in the round ending vote
	from := msg.Author
	forWhoRaw := msg.Body["for"].(string)
	forWhoId, err := strconv.Atoi(forWhoRaw)
	if err != nil {
		fmt.Printf("Error: Incorrect request body %s.", err.Error())
		return
	}
	forWho, ok := models.GlobalRoom.Players.Players[forWhoId]
	if !ok {
		fmt.Println("Error: Incorrect player id in HandleVote.")
		return
	}
	Voted(from, forWho)
}
func HandleSendState(msg models.ClientMessage) {
	// called when player client requests state
	to := msg.Author
	SendState(to)
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
func HandleEndGame() {
	// called when GM requests the game to end
	EndGame()
}

// TODO: ADD PAUSE/GIVE THE FULL GAME FLOW TO GM
