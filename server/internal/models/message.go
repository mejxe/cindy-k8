package models

import "fmt"

type MessageType string
type GMManipulateAction string

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
	GMMessageStart               MessageType = "start"
	GMMessageNext                MessageType = "next"
	GMMessageEnd                 MessageType = "end"
	GMMessageManipulatePlayer    MessageType = "manipulate"
	GMMessageAuth                MessageType = "auth"
	GMMessageSummarizeVote       MessageType = "summarize"
	GMMessageSendState           MessageType = "gsgm"
	GMMessageShiftTime           MessageType = "timeshift"
	GMMessageSendStateToEveryone MessageType = "gsGlobal"
)

// GM Manipulate Actions
const (
	Kill GMManipulateAction = "kill"
	Kick GMManipulateAction = "kick"
)

// Server Message Types
// TODO: think about hard typing all the messageTypes
const (
	ServerMessageStart        MessageType = "started"
	ServerMessageEnd          MessageType = "ended"
	ServerMessagePKilled      MessageType = "pkilled"
	ServerMessageMicPassed    MessageType = "micPassed"
	ServerMessageToken        MessageType = "token"
	ServerMessageFoundBody    MessageType = "body"
	ServerMessageVoteReceived MessageType = "voted"
	ServerMessageNightStarted MessageType = "timeShifted"
	ServerMessageNextRound    MessageType = "nextRound"
	ServerMessageAwaitVote    MessageType = "waitingForVote"
	ServerMessageVoteSummary  MessageType = "voteSummary"
	ServerMessageSendState    MessageType = "gameState"
	ServerMessagePlayerInfo   MessageType = "playerInfo"
	ServerMessageKicked       MessageType = "kicked"
	ServerMessageIdentity     MessageType = "id"
	ServerError               MessageType = "error"
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

func (sm *ServerMessage) String() string {
	return fmt.Sprintf("Type: %s\nBody: %s", sm.Type, sm.Body)
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
func NewGMMessage(messageType MessageType, body map[string]any) GMMessage {
	if body == nil {
		body = map[string]any{}
	}
	return GMMessage{
		Type: messageType, Body: body,
	}
}
func NewError(message string) ServerMessage {
	msg := map[string]any{
		"message": message,
	}
	return NewServerMessage(ServerError, msg)
}
func CreateStateMessage() ServerMessage {
	return NewServerMessage(ServerMessageSendState, GlobalRoom.GetState())
}
