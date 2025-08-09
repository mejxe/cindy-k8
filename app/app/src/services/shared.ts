import { ClientMessageTypes, type GameStateBody, type ParsedWSMessage, type WSPlayerInfo } from "../types/messageTypes"
import type { GameState } from "../types/types"

// TODO: Maybe make different parser for gm
export function parseWSMessages(jsonString: string): ParsedWSMessage | null {
  // TODO: make not nullable eventually
  console.log("parsing: ", jsonString)
  try {
    const message = JSON.parse(jsonString)

    switch (message.type) {
      case "gameState": {
        return {
          type: "gameState",
          body: message.body as GameStateBody
        }
      }
      case "started": {
        return {
          type: ClientMessageTypes.Started,
          body: null
        }
      }
      case "error": {
        return {
          type: "error",
          body: { message: message.body.mesage }
        }
      }
      case "playerInfo": {
        return message as WSPlayerInfo
      }
      case "ended": {
        return {
          type: "ended",
          body: "result"
        }
      }
      default: return null
    }
  }
  catch (e) {
    console.error(e)
    return null
  }
}
export function updateGameState(receivedGameState: GameStateBody, forGM: boolean): GameState {
  const updatedGameState: GameState = {
    players: receivedGameState.players,
    round: receivedGameState.gameState.round,
    numPlayersAlive: receivedGameState.gameState.numPlayersAlive,
    night: receivedGameState.gameState.night,
    started: receivedGameState.gameState.started,
    holdingMic: null,
    voting: false
  }
  if (!forGM) {
    updatedGameState.players.forEach((p) => {
      p.syndicate = false
    })
  }
  return updatedGameState
}
