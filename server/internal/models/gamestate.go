package models

import (
	"github.com/mejxe/cindy-k8/internal/logging"
)

type Result struct {
	Finished      bool
	SyndicateWins bool
}
type GameSummary struct {
	SyndicateWins bool  `json:"syndicateWins"`
	PlayersLeft   int   `json:"playersLeft"`
	SyndicateIDs  []int `json:"syndicate"`
}
type GameState struct {
	Round             int
	NumPlayersAlive   int
	NumSyndicateAlive int
	Night             bool // is it night?
	Started           bool
	HoldingMic        *Player
	RoundsBody        *DeadBody
	CurrentVote       Vote
}

// gs implementation block

// cycle through night and day
func (g *GameState) NextTime() {
	if !g.Started {
		return
	}
	g.UpdatePlayerNumbers()
	res := g.CheckWinCons()
	if res.Finished {
		GlobalRoom.GMInChannel <- NewGMMessage(GMMessageEnd, map[string]any{"syndicateWins": res.SyndicateWins})
	}
	g.Night = !g.Night
	if g.Night {
		g.CurrentVote = &SyndicateVote{}
		g.CurrentVote.Init()
		go g.CurrentVote.Start()

	} else {
		g.CurrentVote = &CityVote{}
	}
}

// start the next round, update NumPlayersAlive, set daytime
func (g *GameState) NextRound() {
	if !g.Started || !g.Night {
		return
	}
	g.UpdatePlayerNumbers()
	res := g.CheckWinCons()
	if res.Finished {
		GlobalRoom.GMInChannel <- NewGMMessage(GMMessageEnd, map[string]any{"syndicateWins": res.SyndicateWins})
	}
	g.Round++
	g.Night = false
}
func (g *GameState) CheckWinCons() Result {
	logging.Info.Printf("Checking win conditions: NumPlayersAlive:%d; NumSyndicateAlive:%d\n", g.NumPlayersAlive, g.NumSyndicateAlive)
	if g.NumPlayersAlive-g.NumSyndicateAlive <= g.NumSyndicateAlive {
		return Result{Finished: true, SyndicateWins: true}
	}
	if g.NumSyndicateAlive < 1 {
		return Result{Finished: true, SyndicateWins: false}
	}

	return Result{Finished: false}
}
func (g *GameState) UpdatePlayerNumbers() {
	logging.Info.Println("UpdatePlayerNumbers: Updated the numbers.")
	GlobalRoom.Players.Lock()
	defer GlobalRoom.Players.Unlock()
	g.NumPlayersAlive = GlobalRoom.Players.GetAlivePlayersAmount()
	g.NumSyndicateAlive = GlobalRoom.Players.GetSyndicateAmount()
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
	g.NumSyndicateAlive = 0
	g.CurrentVote = &CityVote{}
	return gameSummary
}
