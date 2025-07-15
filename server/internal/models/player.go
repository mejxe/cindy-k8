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

type Players struct {
	sync.Mutex
	Players map[int]Player
}
type DeadBody struct {
	Of       *Player
	KilledBy *Player
}

// Globs
var GlobalPlayers Players = Players{Players: make(map[int]Player)}
