package models

import (
	"slices"

	"github.com/mejxe/cindy-k8/internal/logging"
)

type SyndicateVote struct {
	// 1 vote per round
	Votes        map[*Player]int // num of votes per player
	Started      bool            // if the vote started already
	VoteChannel  chan SingleVote // votes received by server come through here
	AlreadyVoted []int           // player ids for syncing with front
}

func (v *SyndicateVote) Init() {
	v.VoteChannel = make(chan SingleVote)
	v.Votes = make(map[*Player]int)
	for _, player := range GlobalRoom.Players.Players {
		if player.Syndicate || !player.Alive {
			continue
		}
		v.Votes[player] = 0
	}
	v.Started = true
}

func (v *SyndicateVote) Start() {
	// start the vote loop
	// TODO: ADD A TIMER THAT WILL STOP THE VOTE AFTER ~ 20s
	for sVote := range v.VoteChannel {
		if slices.Contains(v.AlreadyVoted, sVote.From.Id) || !sVote.From.Syndicate {
			continue
		}
		logging.Info.Printf("Vote: Received a vote from: %d, for %d.\n", sVote.From.Id, sVote.ForWho.Id)
		// receive votes and increment state
		v.Votes[sVote.ForWho]++
		// consume the list, check if next is last
		v.AlreadyVoted = append(v.AlreadyVoted, sVote.From.Id)

		GlobalRoom.OutChannel <- NewServerMessage(ServerMessageVoteUpdate, v.Map())
		logging.Info.Println("Vote: Sending out vote updates.")

		if len(v.AlreadyVoted) == GlobalRoom.GameState.NumSyndicateAlive {
			// if the last person on the list, end vote
			logging.Info.Println("Vote: Last person voted, summarizing...")
			break
		}
	}
	GlobalRoom.GMInChannel <- GMMessage{Type: GMMessageSummarizeVote, Body: nil}
}
func (v *SyndicateVote) Finish() ([]*Player, int) {
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
	v = nil
	return votedOut, voteAmount // returns player(s) with most votes and amount of the votes

}
func (v *SyndicateVote) GetChannel() chan SingleVote {
	return v.VoteChannel
}
func (v *SyndicateVote) GetStarted() bool {
	return v.Started
}
