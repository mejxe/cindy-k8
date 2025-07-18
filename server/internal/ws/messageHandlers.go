package ws

import "github.com/mejxe/cindy-k8/internal/models"
import "github.com/mejxe/cindy-k8/internal/service"

func HandleClientMessages() {
	// handles ClientInChannel where structured client messages come throug calls methods
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
func HandleGMMessages() {
	// handles GMInChannel where structured GM messages come through and calls methods
	for msg := range models.GlobalRoom.GMInChannel {
		switch msg.Type {
		case models.GMMessageSummarizeVote:
			service.HandleVoteSummary(msg)

		case models.GMMessageTypeStart:
			service.HandleStartGame()

		case models.GMMessageTypeEnd:
			service.HandleEndGame()
		}
	}
}
