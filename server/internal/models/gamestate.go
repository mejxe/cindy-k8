package models

type Result struct {
	finished      bool
	syndicateWins bool
}
type GameSummary struct {
	SyndicateWins bool  `json:"syndicateWins"`
	PlayersLeft   int   `json:"playersLeft"`
	SyndicateIDs  []int `json:"syndicate"`
}
type GameState struct {
	Round           int
	NumPlayersAlive int
	Night           bool // is it night?
	Started         bool
	HoldingMic      *Player
	RoundsBody      *DeadBody
	CurrentVote     *Vote
}

// gs implementation block

// reset state and set started = true
func (g *GameState) StartGame() {
	g.Started = true
	g.Round = 0
	g.NumPlayersAlive = len(GlobalRoom.Players.Players)
	g.CurrentVote = &Vote{}
}

// cycle through night and day
func (g *GameState) NextTime() {
	if !g.Started {
		return
	}
	g.Night = !g.Night
}

// start the next round, update NumPlayersAlive, set daytime
func (g *GameState) NextRound() {
	if !g.Started || !g.Night {
		return
	}
	res := g.CheckWinCons()
	if res.finished {
		GlobalRoom.GMInChannel <- NewGMMessage(GMMessageEnd, map[string]any{"syndicateWins": res.syndicateWins})
	}
	g.Round++
	g.Night = false
	g.NumPlayersAlive = len(GlobalRoom.Players.Players)
}
func (g *GameState) CheckWinCons() Result {
	syndicateLeft := 0
	println("syndicate members: ", syndicateLeft)
	for _, p := range GlobalRoom.Players.Players {
		if p.Syndicate {
			syndicateLeft++
		}
	}
	if g.Night && (g.NumPlayersAlive-syndicateLeft <= syndicateLeft) {
		return Result{finished: true, syndicateWins: true}
	}
	if syndicateLeft < 1 {
		return Result{finished: true, syndicateWins: false}
	}

	return Result{finished: false}
}

// end the game
func (g *GameState) FinishGame(syndicateWins bool) GameSummary {

	var syndicateIDs []int
	for _, player := range GlobalRoom.Players.Players {
		if player.Syndicate {
			syndicateIDs = append(syndicateIDs, player.Id)
		}
	}
	gameSummary := GameSummary{
		SyndicateWins: syndicateWins,
		PlayersLeft:   g.NumPlayersAlive,
		SyndicateIDs:  syndicateIDs,
	}

	g.Started = false
	g.Night = false
	g.Round = 0
	g.NumPlayersAlive = 0
	g.CurrentVote = nil
	return gameSummary
}
