package models

import "github.com/mejxe/cindy-k8/internal/logging"

type Room struct {
	Players         *Players
	GameMaster      *GameMaster // one game master per game, connected to separate ws
	GameState       *GameState
	ClientInChannel chan ClientMessage // user requests come through here
	GMInChannel     chan GMMessage     // gm requests come through here
	OutChannel      chan ServerMessage // server responds through here
}

func (room *Room) CloseConnections() {
	room.Players.Mutex.Lock()
	logging.Warning.Println("Locking players in closeConn")
	defer logging.Warning.Println("Unlocked players in closeConn.")
	defer room.Players.Mutex.Unlock()
	for _, p := range room.Players.Players {
		// kick out players that didn't disconnect
		if p.Connection != nil {
			p.Connection.Close()
		}
	}
	room.Players.Players = make(map[int]*Player)
	logging.Warning.Println("Game ended, disconnecting players....")
	logging.Info.Printf("Players cleared: 'Players: %x'", room.Players.Players)
}

// reset state and set started = true
func (r *Room) StartGame() {
	r.GameState.Started = true
	r.GameState.Round = 0
	r.GameState.NumPlayersAlive = len(GlobalRoom.Players.Players)
	r.GameState.CurrentVote = &CityVote{}
	ok := r.Players.AssignSyndicate(r.GameState.NumPlayersAlive)
	if !ok {
		logging.Error.Println("StartGame: Not enough players to start a game!")
		return
	}
	r.GameState.NumSyndicateAlive = r.Players.GetSyndicateAmount()
}

// glob variables export
var GlobalRoom *Room = &Room{
	Players: &Players{Players: make(map[int]*Player)},
	GameState: &GameState{
		CurrentVote: &CityVote{},
	},
	ClientInChannel: make(chan ClientMessage, 10),
	GMInChannel:     make(chan GMMessage, 3),
	OutChannel:      make(chan ServerMessage, 10),
}
