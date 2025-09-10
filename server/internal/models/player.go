package models

import (
	"math/rand/v2"
	"sync"

	"github.com/mejxe/cindy-k8/internal/logging"
	"golang.org/x/net/websocket"
)

type GameMaster struct {
	Connection *websocket.Conn
	Connected  bool
	Password   []byte
}

type Player struct {
	Id         int
	FirstName  string
	LastName   string
	Occupation string
	Syndicate  bool // is the player evil
	Alive      bool
	Connection *websocket.Conn
	Token      string
}

type Players struct {
	sync.Mutex
	Players map[int]*Player
}
type DeadBody struct {
	// representation of a Dead Body, only one per round atm, stored in gamestate, can be reported
	Of       *Player
	KilledBy *Player
}

func (ps *Players) GetSyndicateAmount() int {
	ps.Lock()
	defer ps.Unlock()
	syndicateLeft := 0
	for _, p := range ps.Players {
		if p.Syndicate {
			syndicateLeft++
		}
	}
	return syndicateLeft

}
func (ps *Players) AssignSyndicate(playersAlive int) (ok bool) {
	ps.Lock()
	defer ps.Unlock()
	syndicateAmount := 0
	if playersAlive < 7 {
		syndicateAmount = 1
		//ok = false //TODO: uncomment
		//return
	} else if playersAlive <= 10 {
		syndicateAmount = 2
	} else if playersAlive > 10 {
		syndicateAmount = 3 + (playersAlive-10)/4
	}
	ids := make([]int, 0, len(ps.Players))
	for k := range ps.Players {
		ids = append(ids, k)
	}
	rand.Shuffle(len(ids), func(i, j int) {
		ids[i], ids[j] = ids[j], ids[i]
	})
	for i := range syndicateAmount {
		player := ps.Players[ids[i]]
		player.Syndicate = true
		logging.Info.Printf("AssignSyndicate: %s %s is a syndicate member.", player.FirstName, player.LastName)
	}
	ok = true

	return
}

// Globs
