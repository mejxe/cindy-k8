package models

import (
	"crypto/md5"
	"fmt"
)

// PLAYER HELPER METHODS
func (p *Player) String() string {
	return fmt.Sprintf("%s %s\n%s", p.FirstName, p.LastName, p.Occupation)
}

/*
toMap()
redacted - redact isSyndicate value
*/
func (p *Player) Map() map[string]any {
	tmap := make(map[string]any)
	tmap["id"] = p.Id
	tmap["firstName"] = p.FirstName
	tmap["lastName"] = p.LastName
	tmap["occupation"] = p.Occupation
	tmap["alive"] = p.Alive
	tmap["connected"] = p.Connection != nil
	return tmap
}
func (p *Player) UpgradeMap(pmap map[string]any) map[string]any {
	pmap["syndicate"] = p.Syndicate
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
func (ps *Players) Map() map[string]map[string]any {
	playersMap := make(map[string]map[string]any)
	for i, p := range ps.Players {
		playersMap[fmt.Sprintf("player #%d", i)] = p.Map()
	}
	return playersMap
}
func (ps *Players) Array() []map[string]any {
	// TODO: FIX THE RANDOM NULL WHILE PLAYER JOINS
	playersArray := make([]map[string]any, 0, len(ps.Players))
	for _, p := range ps.Players {
		playersArray = append(playersArray, p.Map())
	}
	return playersArray

}
func (ps *Players) GMMap() map[string]map[string]any {
	playersMap := make(map[string]map[string]any)
	for i, p := range ps.Players {
		playersMap[fmt.Sprintf("player #%d", i)] = p.UpgradeMap(p.Map())
	}
	return playersMap
}
func (ps *Players) GMArray() []map[string]any {
	playersArray := make([]map[string]any, 0, len(ps.Players))
	for _, p := range ps.Players {
		playersArray = append(playersArray, p.UpgradeMap(p.Map()))
	}
	return playersArray
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
	return fmt.Sprintf("type: %s\nauthor: %s\nbody: %s", cs.Type, cs.Author, cs.Body)
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
		"players":   r.Players.Array(),
		"gameState": r.GameState.Map(),
	}
}
func (r *Room) GetStateGM() map[string]any {
	return map[string]any{
		"players":   r.Players.GMArray(),
		"gameState": r.GameState.Map(),
	}
}

func generateMD5(pass string) []byte {
	hash := md5.Sum([]byte(pass))
	return hash[:]
}

func (s *GameSummary) Map() map[string]any {
	return map[string]any{
		"playersLeft":   s.PlayersLeft,
		"syndicateWins": s.SyndicateWins,
		"syndicate":     s.SyndicateIDs,
	}
}
func (v *Vote) Map() map[string]any {
	var currentlyVoting *int = nil
	var votingNext *int = nil
	if v.CurrentlyVoting != nil {
		currentlyVoting = &v.CurrentlyVoting.Identity.Id
	}
	if currentlyVoting != nil && v.CurrentlyVoting.NextV != nil {
		votingNext = &v.CurrentlyVoting.NextV.Identity.Id
	}

	votesMap := make(map[int]int) // PlayerID: voteAmount
	for player, votes := range v.Votes {
		votesMap[player.Id] = votes
	}

	return map[string]any{
		"voteOn":          v.Started,
		"type":            "citizen",
		"currentlyVoting": currentlyVoting,
		"votingNext":      votingNext,
		"votes":           votesMap,
	}
}
