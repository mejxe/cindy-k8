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
			service.HandleEliminateVote(msg)
		case models.ClientMessagePassMic:
			service.HandlePassMic(msg)
		case models.ClientMessageVote:
			service.HandleVote(msg)
		case models.ClientMessageGetState:
			service.HandleSendState(msg)
		case models.ClientMessageVoteFirst:
			service.HandleVoteFirst(msg)
		case models.ClientMessageGetVoteInfo:
			service.HandleGetVoteInfo(msg)
		case models.ClientMessageGetIdentity:
			service.HandleGetIdentity(msg)
		}
	}
}

// handles GMInChannel where structured GM messages come through and calls methods
func HandleGMMessages() {
	for msg := range models.GlobalRoom.GMInChannel {
		logging.Info.Printf("Handling message: %s", msg.Type)
		switch msg.Type {
		case models.GMMessageSendState:
			service.HandleSendGMState()
		case models.GMMessageSendStateToEveryone:
			service.HandleSendStateToEveryone()
		case models.GMMessageSummarizeVote:
			service.HandleVoteSummary(msg)
		case models.GMMessageManipulatePlayer:
			service.HandleManipulate(msg)
		case models.GMMessageStart:
			service.HandleStartGame()
		case models.GMMessageEnd:
			service.HandleEndGame(msg)
		case models.GMMessageNext:
			service.HandleNextRound()
		case models.GMMessageShiftTime:
			service.HandleShiftTime()
		case models.GMMessageGetVoteInfo:
			service.HandleGMGetVoteInfo()
		case models.GMMessageStartVote:
			service.HandleStartVote()
		case models.GMMessageEndVote:
			service.HandleEndVote()
		}
	}
}
func HandleBrodcast() {
	// Send to everyone messages flowing through OutChannel
	for msgToSend := range room.OutChannel {

		// the message
		jsonMsg, _ := json.Marshal(msgToSend)

		// the state updates
		//	stateMsg, _ := json.Marshal(models.NewServerMessage(models.ServerMessageSendState, room.GetState()))
		GMstateMsg, _ := json.Marshal(models.NewServerMessage(models.ServerMessageSendState, room.GetStateGM()))

		// send to gm
		if room.GameMaster.Connected {
			if !(msgToSend.Type == models.ServerMessageSendState) {
				room.GameMaster.Connection.Write(jsonMsg)
			}
			room.GameMaster.Connection.Write(GMstateMsg)
		}

		// send to players
		players.Lock()
		logging.Warning.Println("Locking players in brodcast.")
		for _, p := range players.Players {
			if p.Connection == nil { // skip disconnected users
				continue
			}
			// if player is syndicate he gets upgraded state
			if p.Syndicate && msgToSend.Type == models.ServerMessageSendState {
				jsonMsg = GMstateMsg
			}
			if msgToSend.Type == models.ServerMessageVoteUpdate &&
				models.GlobalRoom.GameState.CurrentVote.GetType() == models.Syndicate &&
				!p.Syndicate {
				continue
			}
			// TODO: Clean up deciding which messages go where

			p.Connection.Write(jsonMsg)
			//logging.Info.Printf("Sent %s", jsonMsg)
			//		p.Connection.Write(stateMsg)
		}
		players.Unlock()
		logging.Warning.Println("Unlocked players in brodcast.")
	}
}
