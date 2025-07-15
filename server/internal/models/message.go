package models

type MessageType string

// Client Message Types
const (
	ClientMessagePassMic  MessageType = "mic"
	ClientMessageVote     MessageType = "vote"
	ClientMessageKill     MessageType = "kill"
	ClientMessageGetState MessageType = "getGS"
)

// GM MessageTypes
const (
	GMMessageTypeStart MessageType = "start"
	GMMessageTypePause MessageType = "pause"
	GMMessageTypeKick  MessageType = "kick"
	GMMessageTypeKill  MessageType = "kill"
	GMMessageTypeAuth  MessageType = "auth"
)

// Server Message Types
const (
	ServerMessageStart     MessageType = "started"
	ServerMessageEnd       MessageType = "ended"
	ServerMessagePKilled   MessageType = "pkilled"
	ServerMessageMicPassed MessageType = "micPassed"
	ServerMessageToken     MessageType = "token"
	ServerMessageFoundBody MessageType = "body"
	Error                  MessageType = "error"
)

type ClientMessage struct {
	Type   MessageType    `json:"type"`
	Author *Player        `json:"author"`
	Body   map[string]any `json:"body"`
}
type ServerMessage struct {
	Type MessageType
	Body map[string]any
}
type GMMessage struct {
	Type MessageType
	Body map[string]any
}

func NewClientMessage(messageType MessageType, author *Player, body map[string]any) ClientMessage {
	return ClientMessage{
		Type: messageType, Author: author, Body: body,
	}
}
func NewServerMessage(messageType MessageType, body map[string]any) ServerMessage {
	if body == nil {
		body = map[string]any{}
	}
	return ServerMessage{
		Type: messageType, Body: body,
	}
}
