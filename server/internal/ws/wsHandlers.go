package ws

import (
	"encoding/json"

	"github.com/mejxe/cindy-k8/internal/logging"
	"github.com/mejxe/cindy-k8/internal/models"
	"golang.org/x/net/websocket"
)

var room = models.GlobalRoom
var players = models.GlobalRoom.Players

func HandleGmConnection(ws *websocket.Conn) {
	// Handle join, auth, and then Unmarshal and send messages to GMInChannel for handling
	logging.Info.Println("Game master joined the lobby.")

	if !ws.Request().URL.Query().Has("password") {
		ws.Write([]byte("Password not provided."))
		return
	}
	if !VerifyGM(ws.Request().URL.Query().Get("password")) {
		ws.Write([]byte("Incorrect password."))
		return
	}

	logging.Success.Println("Game Master verified correctly!")

	room.GameMaster.Connected = true
	room.GameMaster.Connection = ws
	room.GMInChannel <- models.NewGMMessage(models.GMMessageSendState, nil)
	room.GMInChannel <- models.NewGMMessage(models.GMMessageSendStateToEveryone, nil)
	if room.GameState.CurrentVote.GetStarted() {
		room.GMInChannel <- models.NewGMMessage(models.GMMessageGetVoteInfo, nil)
	}
	buf := make([]byte, 1024)
	for {
		n, err := ws.Read(buf)

		if err != nil {
			break
		}

		msg := buf[:n]
		logging.Info.Printf("GM Channel in: %s\n", string(msg))
		var gmMsg models.GMMessage

		if json.Unmarshal(msg, &gmMsg) != nil {
			logging.Error.Println("GM Channel in: cannot parse the message!")
			continue
		}
		models.GlobalRoom.GMInChannel <- gmMsg

	}
	room.GameMaster.Connected = false
	room.GameMaster.Connection = nil
	logging.Warning.Println("Game master disconnected.")

}

func HandleRoom(ws *websocket.Conn) {
	// Handle users joining the room
	if !ws.Request().URL.Query().Has("token") {
		ws.Write([]byte("Token not provided."))
		return
	}
	logging.Info.Printf("New connection opened!\n")

	token := ws.Request().URL.Query().Get("token")
	logging.Info.Printf("User token is: %s\n", token)

	identity := getIdentity(token)

	if identity == nil {
		logging.Error.Println("User token does not match any character tokens.")
		json.NewEncoder(ws).Encode(models.NewError("Invalid token for this session."))
		ws.Close()
		return
	}
	room.Players.Lock()

	identity.Connection = ws

	// send player identity and store it in the frontend
	json.NewEncoder(identity.Connection).
		Encode(models.NewServerMessage(models.ServerMessageIdentity, identity.UpgradeMap(identity.Map())))

	// send get state request
	models.GlobalRoom.ClientInChannel <- models.NewClientMessage(models.ClientMessageGetState, identity, nil)

	// if vote on send vote state request
	if models.GlobalRoom.GameState.CurrentVote != nil && models.GlobalRoom.GameState.CurrentVote.GetStarted() {
		models.GlobalRoom.ClientInChannel <- models.
			NewClientMessage(models.ClientMessageGetVoteInfo, identity, nil)
	}

	// notify already connected players about new join
	body := map[string]any{
		"action":  "connected",
		"players": room.Players.Array(),
	}
	models.GlobalRoom.OutChannel <- models.NewServerMessage(models.ServerMessagePlayerInfo, body)

	buf := make([]byte, 1024)
	room.Players.Unlock()
	for {
		// read, deserialize, and pass messages for further handling
		n, err := ws.Read(buf)
		if err != nil {
			break
		}
		msg := buf[:n]
		logging.Info.Printf("Read message: %s\n", string(msg))

		var clientMsg models.ClientMessage

		if json.Unmarshal(msg, &clientMsg) != nil {
			logging.Error.Printf("Error: Can't parse message %s\n", string(msg))
			continue
		}

		clientMsg.Author = identity

		logging.Info.Printf("Succesfully marshaled the message")
		models.GlobalRoom.ClientInChannel <- clientMsg

	}
	identity.Connection = nil
	logging.Warning.Printf("Player #%d %s %s disconnected\n", identity.Id, identity.FirstName, identity.LastName)

	body = map[string]any{
		"player": identity.Id,
		"action": "disconnected",
	}
	room.OutChannel <- models.NewServerMessage(models.ServerMessagePlayerInfo, body)
}
