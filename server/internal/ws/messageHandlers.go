package ws

import (
	"encoding/json"

	"github.com/mejxe/cindy-k8/internal/logging"
	"github.com/mejxe/cindy-k8/internal/models"
	"github.com/mejxe/cindy-k8/internal/service"
)

// handles ClientInChannel where structured client messages come throug calls methods
func HandleClientMessages() {
	for msg := range models.GlobalRoom.ClientInChannel {
		switch msg.Type {
		case models.ClientMessageKill:
			service.HandleEliminate(msg)
		case models.ClientMessagePassMic:
			service.HandlePassMic(msg)
		case models.ClientMessageVote:
			service.HandleVote(msg)
		case models.ClientMessageGetState:
			service.HandleSendState(msg)
		}
	}
}

// handles GMInChannel where structured GM messages come through and calls methods
func HandleGMMessages() {
	for msg := range models.GlobalRoom.GMInChannel {
		switch msg.Type {
		case models.GMMessageSendState:
			service.HandleSendGMState()
		case models.GMMessageSendStateToEveryone:
			service.HandleSendStateToEveryone()
		case models.GMMessageSummarizeVote:
			service.HandleVoteSummary(msg)
		case models.GMMessageStart:
			service.HandleStartGame()
		case models.GMMessageEnd:
			service.HandleEndGame()
		case models.GMMessageNext:
			service.HandleNextRound()
		case models.GMMessageShiftTime:
			service.HandleShiftTime()
		}
	}
}
func HandleBrodcast() {
	// Send to everyone messages flowing through OutChannel
	for msgToSend := range room.OutChannel {
		logging.Info.Printf("Sending %s", msgToSend.String())

		// the message
		jsonMsg, _ := json.Marshal(msgToSend)

		// the state updates
		stateMsg, _ := json.Marshal(models.NewServerMessage(models.ServerMessageSendState, room.GetState()))
		GMstateMsg, _ := json.Marshal(models.NewServerMessage(models.ServerMessageSendState, room.GetStateGM()))

		// send to gm
		room.GameMaster.Connection.Write(jsonMsg)
		room.GameMaster.Connection.Write(GMstateMsg)

		// send to players
		for _, p := range players.Players {
			p.Connection.Write(jsonMsg)
			p.Connection.Write(stateMsg)
		}
	}
}
