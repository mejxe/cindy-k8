package models

import (
	"sync"

	"golang.org/x/net/websocket"
)

type GameMaster struct {
	Connection *websocket.Conn
	Connected  bool
	Password   []byte
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
	Players map[int]*Player
}
type DeadBody struct {
	// representation of a Dead Body, only one per round atm, stored in gamestate, can be reported
	Of       *Player
	KilledBy *Player
}

func InitGM(password string) {

}

// Globs
