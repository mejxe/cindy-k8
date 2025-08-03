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

/*
toMap()
redacted - redact isSyndicate value
*/
func (p *Player) Map() map[string]string {
	tmap := make(map[string]string)
	tmap["id"] = strconv.Itoa(p.Id)
	tmap["firstName"] = p.FirstName
	tmap["lastName"] = p.LastName
	tmap["occupation"] = p.Occupation
	tmap["alive"] = strconv.FormatBool(p.Alive)
	return tmap
}
func (p *Player) UpgradeMap(pmap map[string]string) map[string]string {
	pmap["syndicate"] = strconv.FormatBool(p.Syndicate)
	return pmap
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

// toMap() for client formatted state
func (ps *Players) Map() map[string]map[string]string {
	playersMap := make(map[string]map[string]string)
	for i, p := range ps.Players {
		playersMap[fmt.Sprintf("player #%d", i)] = p.Map()
	}
	return playersMap
}
func (ps *Players) GMMap() map[string]map[string]string {
	playersMap := make(map[string]map[string]string)
	for i, p := range ps.Players {
		playersMap[fmt.Sprintf("player #%d", i)] = p.UpgradeMap(p.Map())
	}
	return playersMap
}

// END

// toMap() for client formatted state
func (gs *GameState) Map() map[string]any {
	tmap := map[string]any{
		"round":           gs.Round,
		"night":           gs.Night,
		"started":         gs.Started,
		"numPlayersAlive": gs.NumPlayersAlive,
		"holdingMic": func() string {
			if gs.HoldingMic == nil {
				return ""
			}
			return fmt.Sprint(gs.HoldingMic.Id)
		}(),
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
func (r *Room) GetState() map[string]any {
	return map[string]any{
		"players":   r.Players.Map(),
		"gameState": r.GameState.Map(),
	}
}
func (r *Room) GetStateGM() map[string]any {
	return map[string]any{
		"players":   r.Players.GMMap(),
		"gameState": r.GameState.Map(),
	}
}

func generateMD5(pass string) []byte {
	hash := md5.Sum([]byte(pass))
	return hash[:]
}
