import type { Player } from "./types"

export type WSMessage = {
  type: string,
  body: any// TODO: change in the future for hard typed messages somehow
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
export type ParsedWSMessage = GameStateMessage | WSErrorMessage
