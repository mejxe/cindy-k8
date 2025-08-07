import type { Player } from "./types"

export type WSMessage = {
  type: MessageType,
  body: string | null// TODO: change in the future for hard typed messages somehow
}
// TODO: Create a hard typed message type for each message
export interface GameStateMessage {
  type: "gameState",
  body: GameStateBody,
}
export interface GameStateBody {
  players: Record<string, Player>,
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
  Kick: "kick",
  Kill: "kill",
  GetState: "gsgm",
  ShiftTime: "timeshift"
} as const

export const ClientMessageTypes = {
  Started: "started",
  GetState: "getGS",
} as const
export interface WSStartedMessage {
  type: "started",
  body: null
}
export interface WSEndedMessage {
  type: "ended",
  body: "result"
}

export type GMMessageType = typeof GMMessageTypes[keyof typeof GMMessageTypes]
export type ClientMessageType = typeof ClientMessageTypes[keyof typeof ClientMessageTypes]
export type MessageType = GMMessageType | ClientMessageType
export type ParsedWSMessage = GameStateMessage | WSErrorMessage | WSStartedMessage | WSEndedMessage
