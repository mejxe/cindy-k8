package models

type MessageType string

// defined messages that have to match the frontend
// app flow:
// client requests with msg type -> server parses based on msg type -> server responds with another msg type

// Client Message Types
const (
	ClientMessagePassMic  MessageType = "mic"
	ClientMessageVote     MessageType = "vote"
	ClientMessageKill     MessageType = "kill"
	ClientMessageGetState MessageType = "getGS"
)

// GM MessageTypes
const (
	GMMessageTypeStart     MessageType = "start"
	GMMessageTypePause     MessageType = "pause"
	GMMessageTypeEnd       MessageType = "end"
	GMMessageTypeKick      MessageType = "kick"
	GMMessageTypeKill      MessageType = "kill"
	GMMessageTypeAuth      MessageType = "auth"
	GMMessageSummarizeVote MessageType = "summarize"
)

// Server Message Types
const (
	ServerMessageStart        MessageType = "started"
	ServerMessageEnd          MessageType = "ended"
	ServerMessagePKilled      MessageType = "pkilled"
	ServerMessageMicPassed    MessageType = "micPassed"
	ServerMessageToken        MessageType = "token"
	ServerMessageFoundBody    MessageType = "body"
	ServerMessageVoteReceived MessageType = "voted"
	ServerMessageAwaitVote    MessageType = "waitingForVote"
	ServerMessageVoteSummary  MessageType = "voteSummary"
	Error                     MessageType = "error"
)

type ClientMessage struct {
	// message after being parsed from user request
	Type   MessageType    `json:"type"`
	Author *Player        `json:"author"`
	Body   map[string]any `json:"body"`
}
type ServerMessage struct {
	// message that server sends out as json
	Type MessageType    `json:"type"`
	Body map[string]any `json:"body"`
}
type GMMessage struct {
	// message after being parsed from gm request
	Type MessageType    `json:"type"`
	Body map[string]any `json:"body"`
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
