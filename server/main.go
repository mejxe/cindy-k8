package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"strconv"

	"golang.org/x/net/websocket"
)

var reactDir = os.DirFS("../app/app/dist/")

// end

type GameMaster struct {
	connection *websocket.Conn
	connected  bool
}

// gm implementation block
// end
type ClientMessage struct {
	author *Player
	body   []byte
}
type ServerMessage struct {
	code string
	data map[string]any
}

type GameState struct {
	round           int
	numPlayersAlive int
	night           bool // is it night?
	started         bool
}

func (gs *GameState) Map() map[string]string {
	tmap := map[string]string{
		"round":           strconv.Itoa(gs.round),
		"night":           strconv.FormatBool(gs.night),
		"started":         strconv.FormatBool(gs.started),
		"numPlayersAlive": strconv.Itoa(gs.numPlayersAlive),
	}
	return tmap
}

type Room struct {
	players       *Players
	gameMaster    GameMaster
	gameState     GameState
	updateChannel chan ClientMessage
	gmChannel     chan []byte
	outChannel    chan ServerMessage
}

// room implementation block
func (r *Room) startGame() {
	r.gameState.started = true
	r.gameState.round = 0
	r.gameState.numPlayersAlive = len(players.players)
}
func (r *Room) finishGame(syndicateWins bool) {
	r.gameState.started = false
	r.outChannel <- ServerMessage{}

}

func handleSending() {
	for msgToSend := range room.outChannel {
		jsonMsg, _ := json.Marshal(msgToSend)
		for _, p := range players.players {
			p.connection.Write(jsonMsg)
		}
	}
}

func handlePlayerActions() {
	/* possible player actions:

	- find body
	- pass mic
	- vote
	- eliminate player (if mafia)

	*/
	for msg := range room.updateChannel {
		println(msg)
	}
}
func handleGmActions() {
	/* possible gm actions:

	- start/end game
	- give/take mic
	- kick
	- kill

	*/
	for msg := range room.gmChannel {
		println(msg)
		// TODO: add switch for gm actions
	}
}
func handleGmConnection(w *websocket.Conn) {
	println("Game master joined the lobby.")
	room.gameMaster.connected = true
	room.gameMaster.connection = w
	buf := make([]byte, 1024)
	for {
		_, err := w.Read(buf)
		if err != nil {
			break
		}
	}
	room.gameMaster.connected = false
	room.gameMaster.connection = nil
	println("Game master disconnected.")

}

var players Players = Players{players: make(map[int]Player)}
var room Room = Room{updateChannel: make(chan ClientMessage)}

func sendRoomData(ws *websocket.Conn) {
	// data to send: all players (names and occupations), gameStared?, gamemaster
	roomData := map[string]any{
		"players":   players.Map(),
		"gameState": room.gameState.Map(),
	}

	json.NewEncoder(ws).Encode(roomData)

}

func getIdentity(token string) *Player {
	for _, p := range players.players {
		if p.token == token {
			return &p
		}
	}
	return nil

}
func (p *Player) sendToServer(msg []byte) {
	// sends client message to server with id
	message := ClientMessage{author: p, body: msg}
	room.updateChannel <- message

}

func handleRoom(ws *websocket.Conn) {
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
	identity.connection = ws

	// send identity data and room data to display characters
	ws.Write([]byte(identity.String()))
	sendRoomData(ws)

	buf := make([]byte, 1024)
	for {
		// TODO: Add handling for room flow
		n, err := ws.Read(buf)
		msg := buf[:n]
		fmt.Printf("Read message: %s\n", string(msg))
		identity.sendToServer(msg)
		if err != nil {
			break
		}

	}
}
func handleJoin(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Server got a hit: %s", r.URL.Path)
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", 403)
		return
	}

	r.ParseForm()
	var player Player = Player{
		id:         len(players.players),
		firstName:  r.Form.Get("firstName"),
		lastName:   r.Form.Get("lastName"),
		occupation: r.Form.Get("occupation"),
		syndicate:  false,
		alive:      true,
		connection: nil,
		token:      generateToken(),
	}
	players.players[player.id] = player
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
		"token":  player.token,
	})
}
func generateToken() string {
	var token string = ""
	r := rand.Reader
	for range 5 {
		start := int64('A')
		stop := int64('z')
		rLet, _ := rand.Int(r, big.NewInt(stop))
		token += string(rune(start + (rLet.Int64() % (stop - start))))
	}
	return token
}

func main() {
	port := ":8080"

	fmt.Printf("Server started at localhost%s\n", port)
	http.Handle("/", http.FileServerFS(reactDir))
	http.Handle("/create", http.HandlerFunc(handleJoin))
	http.Handle("/ws", websocket.Handler(handleRoom))
	http.Handle("/gm", websocket.Handler(handleGmConnection))
	log.Fatal(http.ListenAndServe(port, nil))

}
