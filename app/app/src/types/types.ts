import type { Dispatch, RefObject, SetStateAction } from "react"
import type { WSMessage } from "./messageTypes"

export const States = {
  Loading: "loading",
  CharacterCreation: "characterCreation",
  Lobby: "lobby",
  Game: "game",
  Results: "results",
} as const

export const defaultState: GameState = {
  players: [],
  round: 0,
  numPlayersAlive: 0,
  night: false,
  started: false,
  holdingMic: null,
  voting: false,
}
export const defaultVote: Vote = {
  type: "citizens",
  voteOn: false,
  currentlyVoting: null,
  votingNext: null,
  votes: new Map(),
  alreadyVoted: new Set<number>()

}
export const defaultGameInfo: GameInfo = {
  gameState: defaultState,
  me: null,
  vote: defaultVote,
}
type VoteType = "mafia" | "citizens"

export type Vote = {
  voteOn: boolean
  type: VoteType,
  currentlyVoting: number | null
  votes: Map<number, number>, // player id : votes for player
  votingNext: number | null,
  alreadyVoted: Set<number>
}
export type VoteJSONBody = {
  voteOn: boolean
  type: VoteType,
  currentlyVoting: number | null
  votes: Record<string, number>, // JSON has string keys
  votingNext: number | null
  alreadyVoted: [number]
}

export type Player = {
  id: number,
  firstName: string,
  lastName: string,
  occupation: string,
  alive: boolean
  syndicate: boolean
  connected: boolean
}
export type GameState = {
  started: boolean,
  players: Player[],
  round: number,
  numPlayersAlive: number,
  night: boolean,
  voting: boolean
  holdingMic: Player | null,
}
export type GameInfo = {
  gameState: GameState,
  me: Player | null
  vote: Vote
}
export type StateKeys = typeof States[keyof typeof States]
export type WebSocketContextType = {
  socket: WebSocket | null,
  connected: boolean
  sendMessage: (message: WSMessage) => void
}
export type wsHandlerFunction = (
  ws: RefObject<WebSocket | null>,
  setAppState: Dispatch<StateKeys>,
  setToken: Dispatch<string | null>,
  setGameState: Dispatch<SetStateAction<GameState>>,
  setMe: Dispatch<Player | null>,
  setVote: Dispatch<Vote>
) => void
