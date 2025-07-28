import type { GameStateBody, ParsedWSMessage } from "../types/messageTypes"
import { States, type AppStateType, type Player } from "../types/types"

export function handleWSMessages(message: ParsedWSMessage, setAppState, websocket, setToken, setGameState) {
  switch (message.type) {
    case "error": {
      console.error(message.body.message)
      setAppState(States.CharacterCreation)
      websocket.current = null
      setToken(null)
      break
    }
    case "gameState": {
      const receivedGameState = message.body
      if (receivedGameState == null) {
        return
      }

      const updatedGameState: AppStateType = {
        players: [],
        round: receivedGameState.gameState.round,
        numPlayersAlive: receivedGameState.gameState.numPlayersAlive,
        night: receivedGameState.gameState.night,
        started: receivedGameState.gameState.started,
        holdingMic: null
      }
      const newPlayers: Player[] = Object.values(receivedGameState.players)
      newPlayers.forEach((p) => {
        const player: Player = {
          firstName: p.firstName,
          lastName: p.lastName,
          occupation: p.occupation,
        }
        updatedGameState.players.push(player)
      })
      setGameState(updatedGameState)

      break
    }
    //case "started": {
    //  setAppState(States.Game)
    //  break
    //}
  }
}
export function connectWS(token: string, websocket, setAppState, setToken, setGameState) {
  const ws = new WebSocket(`http://localhost:8080/ws?token=${token}`)
  ws.onopen = () => {
    console.log("Ws connected.")
    setAppState(States.Lobby)
    websocket.current = ws
  }
  ws.onmessage = (event) => {
    try {
      handleWSMessages(parseWSMessages(event.data), setAppState, websocket, setToken, setGameState)
    } catch (e) {
      console.error(e)
    }
  }
  ws.onclose = () => {
    console.log("Ws disconnected")
    websocket.current = null
    setAppState(States.CharacterCreation)
    setToken(null)
  }
}

export function parseWSMessages(jsonString: string): ParsedWSMessage | null {
  // TODO: make not nullable eventually
  try {
    const message = JSON.parse(jsonString)

    switch (message.type) {
      case "gameState": {
        return {
          type: "gameState",
          body: message.body as GameStateBody
        }
      }
      case "error": {
        return {
          type: "error",
          body: { message: message.body.mesage }
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

