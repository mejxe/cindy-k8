package ws

import "github.com/mejxe/cindy-k8/internal/models"

func HandleClientMessages() {
	for msg := range models.GlobalRoom.ClientInChannel {
		switch msg.Type {
		case models.ClientMessageKill:
		}
	}
}
func HandleGMMessages() {
	for msg := range models.GlobalRoom.GMInChannel {
		// TODO: add switch case and handling for each GMMessageType
		println(msg)
	}
}
func SendOutServerMessages() {
	for msg := range models.GlobalRoom.OutChannel {
		// TODO: add sending messages out
		println(msg)
	}
}
