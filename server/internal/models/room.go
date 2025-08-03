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
// methods that set gamestate fields
func (g *GameState) StartGame() {
	g.Started = true
	g.Round = 0
	g.NumPlayersAlive = len(GlobalRoom.Players.Players)
}
func (g *GameState) NextNight() {
	if !g.Started || g.Night {
		return
	}
	g.Night = true
}

func (g *GameState) NextRound() {
	if !g.Started || !g.Night {
		return
	}
	g.Round++
	g.NumPlayersAlive = len(GlobalRoom.Players.Players)
}
func (g *GameState) FinishGame(syndicateWins bool) {
	g.Started = false

}

// end
// glob variables export
var GlobalRoom *Room = &Room{
	Players:         &Players{Players: make(map[int]*Player)},
	GameState:       &GameState{},
	ClientInChannel: make(chan ClientMessage, 10),
	GMInChannel:     make(chan GMMessage, 2),
	OutChannel:      make(chan ServerMessage, 10),
}
