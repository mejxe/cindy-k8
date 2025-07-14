package models

import (
	"sync"

	"golang.org/x/net/websocket"
)

type GameMaster struct {
	Connection *websocket.Conn
	Connected  bool
}

type Player struct {
	Id         int
	FirstName  string
	LastName   string
	Occupation string
	Syndicate  bool // is the player evil
	Alive      bool
	Connection *websocket.Conn
	Token      string
}

// player implementation block

func (p *Player) Eliminate(citizen Player) {
	if !p.Syndicate || citizen.Syndicate || !citizen.Alive {
		return
	}
	citizen.Alive = false
}

// END

type Players struct {
	sync.Mutex
	Players map[int]Player
}

func (p *Player) SendToServer(msg []byte) {
	// sends client message to server with id
	message := ClientMessage{author: p, body: msg}
	GlobalRoom.UpdateChannel <- message

}

var GlobalPlayers Players = Players{Players: make(map[int]Player)}
