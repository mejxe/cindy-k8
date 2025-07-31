package models

import (
	"crypto/md5"
	"fmt"
	"strconv"
)

// PLAYER HELPER METHODS
func (p *Player) String() string {
	return fmt.Sprintf("%s %s\n%s", p.FirstName, p.LastName, p.Occupation)
}
func (p *Player) Map() map[string]string {
	// toMap()
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
	// toMap()
	playersMap := make(map[string]map[string]string)
	for i, p := range ps.Players {
		playersMap[fmt.Sprintf("player%d", i)] = p.Map()
	}
	return playersMap
}

// END

func (gs *GameState) Map() map[string]string {
	// toMap()
	tmap := map[string]string{
		"round":           strconv.Itoa(gs.Round),
		"night":           strconv.FormatBool(gs.Night),
		"started":         strconv.FormatBool(gs.Started),
		"numPlayersAlive": strconv.Itoa(gs.NumPlayersAlive),
	}
	return tmap
}
func (cs *ClientMessage) String() string {
	return fmt.Sprintf("author: %s\nbody: %s", cs.Author, cs.Body)
}

// GM Implementation block
func NewGM(password string) *GameMaster {
	return &GameMaster{
		Connected:  false,
		Connection: nil,
		Password:   generateMD5(password),
	}
}

func generateMD5(pass string) []byte {
	hash := md5.Sum([]byte(pass))
	return hash[:]
}
