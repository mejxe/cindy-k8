package models

type Room struct {
	Players       *Players
	GameMaster    GameMaster
	GameState     GameState
	UpdateChannel chan ClientMessage
	GmChannel     chan []byte
	OutChannel    chan ServerMessage
}

type GameState struct {
	round           int
	numPlayersAlive int
	night           bool // is it night?
	started         bool
}

// room implementation block
func (r *Room) startGame() {
	r.GameState.started = true
	r.GameState.round = 0
	r.GameState.numPlayersAlive = len(GlobalPlayers.Players)
}
func (r *Room) finishGame(syndicateWins bool) {
	r.GameState.started = false
	r.OutChannel <- ServerMessage{}

}

// end
// glob variables export
var GlobalRoom Room = Room{UpdateChannel: make(chan ClientMessage)}
