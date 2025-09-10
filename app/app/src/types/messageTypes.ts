import type { Player, Vote } from "./types"

export type WSMessage = {
  type: MessageType,
  body: any | null// TODO: change in the future for hard typed messages somehow
}

export interface WSSingleVote extends WSMessage {
  type: "vote",
  body: {
    "for": number
  }
}
// TODO: Create a hard typed message type for each message
export interface GameStateMessage {
  type: "gameState",
  body: GameStateBody,
}
export interface GameStateBody {
  players: [Player],
  gameState: {
    round: number,
    numPlayersAlive: number,
    night: boolean,
    started: boolean,
  }
}
export interface WSErrorMessage {
  type: "error",
  body: {
    message: string
  }
}
export const GMMessageTypes = {
  Start: "start",
  NextRound: "next",
  End: "end",
  Manipualte: "manipulate",
  GetState: "gsgm",
  ShiftTime: "timeshift",
  StartVote: "startVote",
} as const

export const ClientMessageTypes = {
  Started: "started",
  GetState: "getGS",
  Voted: "vote",
  VoteFirst: "voteFirst",
  GetMe: "getMe",
} as const
export interface WSStartedMessage {
  type: "started",
  body: null
}
export interface WSEndedMessage {
  type: "ended",
  body: "result"
}
export interface WSPlayerInfo {
  type: "playerInfo",
  body: PlayerConnectedBody | PlayerDisconnectedBody
}
export interface WSPlayerEliminated {
  type: "pkilled",
  body: { "whoDied": number }
}
export interface WSPlayerKicked {
  type: "kicked",
  body: { "who": number }
}
export interface WSPlayerID {
  type: "id",
  body: { id: number, alive: boolean, connected: boolean, firstName: string, lastName: string, occupation: string, syndicate: boolean }
}
export type WSVoteStarted = {
  type: "voteStarted"
}
export interface WSVoteUpdate {
  type: "voteUpdate",
  body: Vote
}
export type WSVoteSummary = {
  type: "voteSummary",
  body: {
    amountOfVotes: number,
    eliminated: [number] // ids of eliminated players
  }
}
interface PlayerConnectedBody {
  action: "connected",
  players: [Player]
}
interface PlayerDisconnectedBody {
  action: "disconnected",
  player: number // player id
}

export type GMMessageType = typeof GMMessageTypes[keyof typeof GMMessageTypes]
export type ClientMessageType = typeof ClientMessageTypes[keyof typeof ClientMessageTypes]
export type MessageType = GMMessageType | ClientMessageType
export type ParsedWSMessage = GameStateMessage | WSErrorMessage |
  WSStartedMessage | WSEndedMessage | WSPlayerInfo | WSPlayerEliminated | WSPlayerKicked | WSPlayerID | WSVoteStarted |
  WSVoteUpdate | WSVoteSummary
