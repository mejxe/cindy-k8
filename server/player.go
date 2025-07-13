package main

import (
	"fmt"
	"strconv"
	"sync"

	"golang.org/x/net/websocket"
)

type Player struct {
	id         int
	firstName  string
	lastName   string
	occupation string
	syndicate  bool // is the player evil
	alive      bool
	connection *websocket.Conn
	token      string
}

// player implementation block

func (p *Player) String() string {
	return fmt.Sprintf("%s %s\n%s", p.firstName, p.lastName, p.occupation)
}
func (p *Player) Map() map[string]string {
	tmap := make(map[string]string)
	tmap["id"] = strconv.Itoa(p.id)
	tmap["firstName"] = p.firstName
	tmap["lastName"] = p.lastName
	tmap["occupation"] = p.occupation
	return tmap
}

func (p *Player) Eliminate(citizen Player) {
	if !p.syndicate || citizen.syndicate || !citizen.alive {
		return
	}
	citizen.alive = false
}

type Players struct {
	sync.Mutex
	players map[int]Player
}

func (ps *Players) String() string {
	str := ""
	for _, p := range ps.players {
		str += p.String() + "\n"
	}
	return str
}
func (ps *Players) Map() map[string]map[string]string {
	playersMap := make(map[string]map[string]string)
	for i, p := range players.players {
		playersMap[fmt.Sprintf("player%d", i)] = p.Map()
	}
	return playersMap
}
