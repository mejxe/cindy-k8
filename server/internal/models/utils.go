package models

import (
	"fmt"
	"strconv"
)

// PLAYER HELPER METHODS
func (p *Player) String() string {
	return fmt.Sprintf("%s %s\n%s", p.FirstName, p.LastName, p.Occupation)
}
func (p *Player) Map() map[string]string {
	tmap := make(map[string]string)
	tmap["id"] = strconv.Itoa(p.Id)
	tmap["firstName"] = p.FirstName
	tmap["lastName"] = p.LastName
	tmap["occupation"] = p.Occupation
	return tmap
}

// END

// PLAYERS HELPER METHODS
func (ps *Players) String() string {
	str := ""
	for _, p := range ps.Players {
		str += p.String() + "\n"
	}
	return str
}
func (ps *Players) Map() map[string]map[string]string {
	playersMap := make(map[string]map[string]string)
	for i, p := range ps.Players {
		playersMap[fmt.Sprintf("player%d", i)] = p.Map()
	}
	return playersMap
}

// END

func (gs *GameState) Map() map[string]string {
	tmap := map[string]string{
		"round":           strconv.Itoa(gs.round),
		"night":           strconv.FormatBool(gs.night),
		"started":         strconv.FormatBool(gs.started),
		"numPlayersAlive": strconv.Itoa(gs.numPlayersAlive),
	}
	return tmap
}
func (cs *ClientMessage) String() string {
	return fmt.Sprintf("author: %s\nbody: %s", cs.author, cs.body)
}
