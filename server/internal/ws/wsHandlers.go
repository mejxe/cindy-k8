package ws

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/mejxe/cindy-k8/internal/models"
	"github.com/mejxe/cindy-k8/internal/service"
	"golang.org/x/net/websocket"
)

var room = models.GlobalRoom
var players = models.GlobalRoom.Players

func HandleSending() {
	// Send to everyone messages flowing through OutChannel
	for msgToSend := range room.OutChannel {
		jsonMsg, _ := json.Marshal(msgToSend)
		for _, p := range players.Players {
			p.Connection.Write(jsonMsg)
		}
	}
}

func HandleGmConnection(w *websocket.Conn) {
	// Handle join, auth, and then Unmarshal and send messages to GMInChannel for handling
	println("Game master joined the lobby.")
	room.GameMaster.Connected = true
	room.GameMaster.Connection = w
	buf := make([]byte, 1024)
	for {
		n, err := w.Read(buf)

		if err != nil {
			break
		}

		var gmMsg models.GMMessage

		if json.Unmarshal(buf[:n], gmMsg) != nil {
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
		ws.Write([]byte("Incorrect token."))
		return
	}
	identity.Connection = ws

	// send identity data and room data to display characters
	ws.Write([]byte(fmt.Sprintf("You are: %s", identity.String())))
	models.GlobalRoom.ClientInChannel <- models.NewClientMessage(models.ClientMessageGetState, identity, nil) // send get state request

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

		if json.Unmarshal(msg, clientMsg) != nil {
			fmt.Printf("Error: Can't parse message %s\n", string(msg))
			continue
		}

		models.GlobalRoom.ClientInChannel <- clientMsg

	}
}
func HandleCreate(w http.ResponseWriter, r *http.Request) {
	// endpoint for handling creation of characters
	fmt.Printf("Server got a hit: %s", r.URL.Path)
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", 403)
		return
	}

	r.ParseForm()
	var player *models.Player = &models.Player{
		Id:         len(players.Players),
		FirstName:  r.Form.Get("firstName"),
		LastName:   r.Form.Get("lastName"),
		Occupation: r.Form.Get("occupation"),
		Syndicate:  false,
		Alive:      true,
		Connection: nil,
		Token:      generateToken(),
	}
	players.Players[player.Id] = player
	msg := map[string]any{
		"status": "ok",
		"token":  player.Token,
	}
	json.NewEncoder(w).Encode(models.NewServerMessage(models.ServerMessageToken, msg))
}
