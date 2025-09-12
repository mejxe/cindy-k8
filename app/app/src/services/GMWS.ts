import type { ParsedWSMessage } from "../types/messageTypes"
import { parseWSMessages, sendRequest } from "./shared.ts"
import { updateGameState } from "./shared"
import { defaultVote, type GameState } from "../types/types.ts"


export function connectWSForGM(password: string, setVerified, setWS, setGameState, gameState, setVote) {
  const host = window.location.hostname === 'localhost'
    ? 'localhost'
    : window.location.hostname;
  const ws = new WebSocket(`ws://${host}:8080/gm?password=${password}`)
  ws.onopen = () => {
    console.log("Ws connected.")
    setWS(ws)
    setVerified(true)
  }
  ws.onmessage = (event) => {
    try {
      console.log(event.data)
      const msg = parseWSMessages(event.data)
      if (msg === null) {
        return
      }
      handleGMMessages(ws, msg, setGameState, gameState, setVote)
    } catch (e) {
      console.error(e)
    }
  }
  ws.onclose = () => {
    console.log("Ws disconnected")
    setWS(null)
    setVerified(false)
  }
}
function handleGMMessages(ws: WebSocket, message: ParsedWSMessage, setGameState, gameState: GameState, setVote) {
  switch (message.type) {
    case "gameState": {
      const receivedGameState = message.body
      if (receivedGameState == null) {
        return
      }
      console.log(receivedGameState)
      const newgs = updateGameState(receivedGameState, true)
      console.log(`new gs: ${newgs}`)
      setGameState(newgs)
      break
    }
    case "error": break
    case "playerInfo": {
      switch (message.body.action) {
        case "connected": {
          gameState.players = message.body.players
          setGameState(gameState)
          break
        }
        case "disconnected": {
          const player = gameState.players.at(message.body.player)
          if (player === undefined) {
            console.log("Disconnected handler: Player is null")
            return
          }
          player.connected = false
          setGameState(gameState)
        }

      }
      break
    }
    case "voteStarted": {
      setVote(() => ({
        ...defaultVote,
        voteOn: true
      })
      )
      break

    }
    case "voteUpdate": {
      const newVote = message.body
      console.log("newVote: ", message)
      setVote(() => ({
        ...newVote
      }))
      break
    }
    case "voteSummary": {
      sendRequest(ws, "gmVoteInfo", null)
      break
    }
  }
}
