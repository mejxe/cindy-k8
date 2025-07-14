package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/mejxe/cindy-k8/internal/models"
	"golang.org/x/net/websocket"
)

var room = &models.GlobalRoom
var players = &models.GlobalPlayers

func HandleSending() {
	for msgToSend := range room.OutChannel {
		jsonMsg, _ := json.Marshal(msgToSend)
		for _, p := range players.Players {
			p.Connection.Write(jsonMsg)
		}
	}
}

func HandlePlayerActions() {
	/* possible player actions:

	- find body
	- pass mic
	- vote
	- eliminate player (if mafia)

	*/
	for msg := range room.UpdateChannel {
		println(msg.String())
	}
}
func HandleGmActions() {
	/* possible gm actions:

	- start/end game
	- give/take mic
	- kick
	- kill

	*/
	for msg := range room.GmChannel {
		println(msg)
		// TODO: add switch for gm actions
	}
}
func HandleGmConnection(w *websocket.Conn) {
	println("Game master joined the lobby.")
	room.GameMaster.Connected = true
	room.GameMaster.Connection = w
	buf := make([]byte, 1024)
	for {
		_, err := w.Read(buf)
		if err != nil {
			break
		}
	}
	room.GameMaster.Connected = false
	room.GameMaster.Connection = nil
	println("Game master disconnected.")

}
func sendRoomData(ws *websocket.Conn) {
	// data to send: all players (names and occupations), gameStared?, gamemaster
	roomData := map[string]any{
		"players":   players.Map(),
		"gameState": room.GameState.Map(),
	}

	json.NewEncoder(ws).Encode(roomData)

}
func HandleRoom(ws *websocket.Conn) {
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
	ws.Write([]byte(identity.String()))
	sendRoomData(ws)

	buf := make([]byte, 1024)
	for {
		// TODO: Add handling for room flow
		n, err := ws.Read(buf)
		msg := buf[:n]
		fmt.Printf("Read message: %s\n", string(msg))
		identity.SendToServer(msg)
		if err != nil {
			break
		}

	}
}
func HandleJoin(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Server got a hit: %s", r.URL.Path)
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", 403)
		return
	}

	r.ParseForm()
	var player models.Player = models.Player{
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
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
		"token":  player.Token,
	})
}
