package models

type Room struct {
	Players         *Players
	GameMaster      *GameMaster
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

// room implementation block
func (r *Room) StartGame() {
	r.GameState.Started = true
	r.GameState.Round = 0
	r.GameState.NumPlayersAlive = len(GlobalRoom.Players.Players)
}
func (r *Room) FinishGame(syndicateWins bool) {
	r.GameState.Started = false
	r.OutChannel <- ServerMessage{}

}

// end
// glob variables export
var GlobalRoom *Room = &Room{
	Players:         &Players{Players: make(map[int]*Player)},
	GameState:       &GameState{},
	ClientInChannel: make(chan ClientMessage),
	GMInChannel:     make(chan GMMessage),
	OutChannel:      make(chan ServerMessage),
}
