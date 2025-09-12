package models

type Vote interface {
	Init()
	Finish() ([]*Player, int)
	Start()
	End()
	// getters
	GetChannel() chan SingleVote
	GetStarted() bool
	GetType() VoteType
	Map() map[string]any
}
type VoteType string

const (
	City      VoteType = "city"
	Syndicate VoteType = "syndicate"
)

type SingleVote struct {
	// a single vote, used to send data from user vote calls to the server (requests/Voted())
	From   *Player
	ForWho *Player
}
