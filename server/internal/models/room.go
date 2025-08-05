package models

type Room struct {
	Players         *Players
	GameMaster      *GameMaster // one game master per game, connected to separate ws
	GameState       *GameState
	ClientInChannel chan ClientMessage // user requests come through here
	GMInChannel     chan GMMessage     // gm requests come through here
	OutChannel      chan ServerMessage // server responds through here
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
	g.Round++
	g.Night = false
	g.NumPlayersAlive = len(GlobalRoom.Players.Players)
}

// end the game
func (g *GameState) FinishGame(syndicateWins bool) {
	// TODO: Should return the results
	g.Started = false

}

// glob variables export
var GlobalRoom *Room = &Room{
	Players:         &Players{Players: make(map[int]*Player)},
	GameState:       &GameState{},
	ClientInChannel: make(chan ClientMessage, 10),
	GMInChannel:     make(chan GMMessage, 2),
	OutChannel:      make(chan ServerMessage, 10),
}
