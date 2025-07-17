package models

import (
	"encoding/json"
	"math/rand/v2"
)

type Vote struct {
	Votes           map[*Player]int
	CurrentlyVoting *Voter
	Started         bool
	VoteChannel     chan SingleVote
}
type Voter struct {
	// linked listed for easy iteration while voting
	Identity *Player
	NextV    *Voter
	VotedFor *Player
}
type SingleVote struct {
	From   *Player
	ForWho *Player
}

func (v *Voter) Next() (last bool) {
	last = false
	if v.NextV == nil {
		last = true
		return last
	}
	*v = *v.NextV
	return last
}
func (v *Voter) Add(p *Player) {
	NextV := Voter{Identity: p, NextV: nil, VotedFor: nil}
	if v == nil {
		v = &NextV
		return
	}
	curr := v
	for curr.NextV != nil {
		curr = curr.NextV
	}
	curr.NextV = &NextV

}
func CreateVotersList(firstVoter *Player) *Voter {
	voterList := Voter{
		Identity: firstVoter,
		NextV:    nil,
		VotedFor: nil,
	}
	GlobalRoom.Players.Lock()
	defer GlobalRoom.Players.Unlock()

	keys := make([]int, 0, len(GlobalRoom.Players.Players))
	for k := range GlobalRoom.Players.Players {
		keys = append(keys, k)
	}
	rand.Shuffle(len(keys), func(i, j int) {
		keys[i], keys[j] = keys[j], keys[i]
	})
	for _, key := range keys {
		voterList.Add(GlobalRoom.Players.Players[key])
	}
	return &voterList

}

// vote impl block
func (v *Vote) Init() {
	v.Votes = make(map[*Player]int)
	for _, player := range GlobalRoom.Players.Players {
		v.Votes[player] = 0
	}
}

func (v *Vote) Start(firstVoter *Player) {
	v.Started = true
	last := false
	votersList := CreateVotersList(firstVoter)
	json.NewEncoder(firstVoter.Connection).Encode(NewServerMessage(ServerMessageAwaitVote, nil))
	for sVote := range v.VoteChannel {
		// receive vote details and increment state
		v.Votes[sVote.ForWho]++
		if last {
			// if the last person on the list, end vote
			break
		}
		// change CurrentlyVoting
		last = votersList.Next()
	}
	GlobalRoom.GMInChannel <- GMMessage{Type: GMMessageSummarizeVote, Body: nil}
}
func (v *Vote) Finish() (*Player, int) {
	maxVotes := 0
	var maxPlayer *Player = nil
	for player, votes := range v.Votes {
		if votes > maxVotes {
			maxVotes = votes
			maxPlayer = player
		}
	}
	v.Started = false
	return maxPlayer, maxVotes

}

// end
