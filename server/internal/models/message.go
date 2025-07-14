package models

type ClientMessage struct {
	author *Player
	body   []byte
}
type ServerMessage struct {
	code string
	data map[string]any
}

func NewClientMessage(author *Player, body []byte) ClientMessage {
	return ClientMessage{
		author, body,
	}
}
