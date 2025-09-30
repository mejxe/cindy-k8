package models

import (
	"math/rand/v2"

	"github.com/mejxe/cindy-k8/internal/logging"
)

// Voting logic

type CityVote struct {
	// 1 vote per round
	Votes           map[*Player]int // num of votes per player
	CurrentlyVoting *Voter          // person currently voting represented by a linked list (next = next voter in queue)
	Started         bool            // if the vote started already
	VoteChannel     chan SingleVote // votes received by server come through here
	AlreadyVoted    []int           // player ids for syncing with front
}
type Voter struct {
	// linked listed for easy iteration while voting
	Identity *Player
	NextV    *Voter
	VotedFor *Player
}

func (v *Voter) Next() (last bool) {
	// consume the list
	last = false
	if v.NextV == nil {
		last = true
		return last
	}
	*v = *v.NextV
	return last
}
func (v *Voter) Add(p *Player) {
	// add to the end of the list
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
func (v *CityVote) CreateVotersList(firstVoter *Player) {
	// create a list of voters in random order
	voterList := Voter{
		Identity: firstVoter,
		NextV:    nil,
		VotedFor: nil,
	}
	GlobalRoom.Players.Lock()
	defer GlobalRoom.Players.Unlock()

	keys := make([]int, 0, len(GlobalRoom.Players.Players))
	for k, p := range GlobalRoom.Players.Players {
		if p == firstVoter || !p.Alive || p.Connection == nil {
			continue
		}
		keys = append(keys, k)
	}
	rand.Shuffle(len(keys), func(i, j int) {
		keys[i], keys[j] = keys[j], keys[i]
	})
	for _, key := range keys {
		voterList.Add(GlobalRoom.Players.Players[key])
	}
	v.CurrentlyVoting = &voterList

}

// vote impl block
func (v *CityVote) Init() {
	v.VoteChannel = make(chan SingleVote)
	v.Votes = make(map[*Player]int)
	for _, player := range GlobalRoom.Players.Players {
		v.Votes[player] = 0
	}
	v.Started = true
}

func (v *CityVote) Start() {
	// start the vote loop
	votersList := v.CurrentlyVoting // currently the first Voter
	last := false
	for sVote := range v.VoteChannel {
		if sVote.From == nil {
			logging.Info.Println("Vote: Received a stop signal, stopping vote...")
			return
		}
		// receive votes and increment state
		logging.Info.Printf("Vote: Received a vote from: %d, for %d.\n", sVote.From.Id, sVote.ForWho.Id)
		v.Votes[sVote.ForWho]++
		// consume the list, check if next is last
		v.AlreadyVoted = append(v.AlreadyVoted, sVote.From.Id)
		last = votersList.Next()
		println("LAST?:", last)

		GlobalRoom.OutChannel <- NewServerMessage(ServerMessageVoteUpdate, v.Map())
		logging.Info.Println("Vote: Sending out vote updates.")

		if last {
			// if the last person on the list, end vote
			logging.Info.Println("Vote: Last person voted, summarizing...")
			break
		}
	}
	GlobalRoom.GMInChannel <- GMMessage{Type: GMMessageSummarizeVote, Body: nil}
}
func (v *CityVote) Finish() ([]*Player, int) {
	// finish the vote and sum up the votes
	votedOut := make([]*Player, 0)
	voteAmount := 0
	for _, votes := range v.Votes {
		if votes > voteAmount {
			voteAmount = votes
		}
	}
	for player, votes := range v.Votes {
		if votes == voteAmount {
			votedOut = append(votedOut, player)
		}
	}
	v.Started = false
	v = &CityVote{}
	return votedOut, voteAmount // returns player(s) with most votes and amount of the votes

}
func (v *CityVote) End() {
	if v.Started {
		v.VoteChannel <- SingleVote{From: nil, ForWho: nil} // stop signal
		v.Started = false
		v = &CityVote{}
	}
}
func (v *CityVote) GetChannel() chan SingleVote {
	return v.VoteChannel
}
func (v *CityVote) GetStarted() bool {
	return v.Started
}
func (v *CityVote) GetType() VoteType {
	return City
}

// end
