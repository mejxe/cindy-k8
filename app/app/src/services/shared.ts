import { ClientMessageTypes, type GameStateBody, type ParsedWSMessage } from "../types/messageTypes"
import type { AppStateType, Player } from "../types/types"

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
export function updateGameState(receivedGameState: GameStateBody, forGM: boolean): AppStateType {
  const updatedGameState: AppStateType = {
    players: [],
    round: receivedGameState.gameState.round,
    numPlayersAlive: receivedGameState.gameState.numPlayersAlive,
    night: receivedGameState.gameState.night,
    started: receivedGameState.gameState.started,
    holdingMic: null,
    voting: false
  }
  const newPlayers: Player[] = Object.values(receivedGameState.players)
  newPlayers.forEach((p) => {
    const player: Player = {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      occupation: p.occupation,
      alive: p.alive,
      syndicate: forGM ? p.syndicate : false
    }
    updatedGameState.players.push(player)
  })
  return updatedGameState
}
