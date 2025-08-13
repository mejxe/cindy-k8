import { ClientMessageTypes, type GameStateBody, type GMMessageType, type ParsedWSMessage, type WSMessage, type WSPlayerEliminated, type WSPlayerID, type WSPlayerInfo, type WSPlayerKicked } from "../types/messageTypes"
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
      case "pkilled": {
        return message as WSPlayerEliminated
      }
      case "kicked": {
        return message as WSPlayerKicked
      }
      case "id": {
        return message as WSPlayerID
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
export function sendRequest(ws: WebSocket, type: GMMessageType, body: any | null) {
  const msg: WSMessage = { type, body }
  ws.send(JSON.stringify(msg))
}
