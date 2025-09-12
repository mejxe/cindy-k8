import type { RefObject } from "react"
import { ClientMessageTypes, type GameStateBody, type GMMessageType, type MessageType, type ParsedWSMessage, type WSMessage, type WSPlayerEliminated, type WSPlayerID, type WSPlayerInfo, type WSPlayerKicked, type WSVoteStarted, type WSVoteSummary, type WSVoteUpdate } from "../types/messageTypes"
import type { GameState, VoteJSONBody } from "../types/types"

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
      case "voteStarted": {
        return message as WSVoteStarted
      }
      case "voteUpdate": {
        const msgBody: VoteJSONBody = message["body"]
        const votesMap = new Map<number, number>();
        for (const [playerIdStr, voteCount] of Object.entries(msgBody.votes)) {
          console.log(playerIdStr, ": ", voteCount)
          const playerId = parseInt(playerIdStr, 10);
          votesMap.set(playerId, voteCount);
        }
        return {
          type: "voteUpdate",
          body: {
            ...msgBody,
            votes: votesMap,
            alreadyVoted: new Set(msgBody.alreadyVoted)
          }
        }
      }
      case "voteSummary": {
        return message as WSVoteSummary
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
  updatedGameState.players.forEach(p => { p.syndicate = p.syndicate ? p.syndicate : false })
  return updatedGameState
}
export function sendRequest(ws: WebSocket, type: MessageType, body: any | null) {
  const msg: WSMessage = { type, body }
  ws.send(JSON.stringify(msg))
}
export function sendGSRequest(ws: WebSocket) {
  const message: WSMessage = { type: ClientMessageTypes.GetState, body: null }
  ws.send(JSON.stringify(message))
  console.log("sent gs request to this ws = ", ws)
}
