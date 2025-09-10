package models

type Vote interface {
	Init()
	Finish() ([]*Player, int)
	Start()
	// getters
	GetChannel() chan SingleVote
	GetStarted() bool
	Map() map[string]any
}
type SingleVote struct {
	// a single vote, used to send data from user vote calls to the server (requests/Voted())
	From   *Player
	ForWho *Player
}
