package ws

import (
	"encoding/json"
	"fmt"

	"github.com/mejxe/cindy-k8/internal/models"
	"golang.org/x/net/websocket"
)

var room = models.GlobalRoom
var players = models.GlobalRoom.Players

func HandleGmConnection(ws *websocket.Conn) {
	// Handle join, auth, and then Unmarshal and send messages to GMInChannel for handling
	println("Game master joined the lobby.")

	if !ws.Request().URL.Query().Has("password") {
		ws.Write([]byte("Password not provided."))
		return
	}
	if !VerifyGM(ws.Request().URL.Query().Get("password")) {
		ws.Write([]byte("Incorrect password."))
		return
	}
	println("Game Master verified correctly!")
	room.GameMaster.Connected = true
	room.GameMaster.Connection = ws
	room.GMInChannel <- models.GMMessage{Type: models.GMMessageSendState}
	room.GMInChannel <- models.GMMessage{Type: models.GMMessageSendStateToEveryone}
	println("sent state request.")
	buf := make([]byte, 1024)
	for {
		n, err := ws.Read(buf)

		if err != nil {
			break
		}

		var gmMsg models.GMMessage

		if json.Unmarshal(buf[:n], &gmMsg) != nil {
			continue
		}
		models.GlobalRoom.GMInChannel <- gmMsg

	}
	room.GameMaster.Connected = false
	room.GameMaster.Connection = nil
	println("Game master disconnected.")

}

func HandleRoom(ws *websocket.Conn) {
	// Handle users joining the room
	if !ws.Request().URL.Query().Has("token") {
		ws.Write([]byte("Token not provided."))
		return
	}
	fmt.Printf("New connection opened!\n")

	token := ws.Request().URL.Query().Get("token")
	fmt.Printf("User token is: %s\n", token)

	identity := getIdentity(token)

	if identity == nil {
		println("User token does not match any character tokens.")
		json.NewEncoder(ws).Encode(models.NewError("Invalid token for this session."))
		return
	}
	identity.Connection = ws

	// send identity data and room data to display characters
	models.GlobalRoom.ClientInChannel <- models.NewClientMessage(models.ClientMessageGetState, identity, nil) // send get state request
	room.GMInChannel <- models.GMMessage{Type: models.GMMessageSendState}

	buf := make([]byte, 1024)
	for {
		// read, deserialize, and pass messages for further handling
		n, err := ws.Read(buf)
		if err != nil {
			break
		}
		msg := buf[:n]
		fmt.Printf("Read message: %s\n", string(msg))

		var clientMsg models.ClientMessage

		if json.Unmarshal(msg, &clientMsg) != nil {
			fmt.Printf("Error: Can't parse message %s\n", string(msg))
			continue
		}

		models.GlobalRoom.ClientInChannel <- clientMsg

	}
}
