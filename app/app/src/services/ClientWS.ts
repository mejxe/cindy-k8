import type { Dispatch, RefObject, SetStateAction } from "react"
import { ClientMessageTypes, type GameStateMessage, type ParsedWSMessage, type WSMessage } from "../types/messageTypes"
import { defaultState, States, type GameState, type StateKeys } from "../types/types"
import { parseWSMessages, updateGameState } from "./shared"


export function handleWSMessages(message: ParsedWSMessage, setAppState, websocket: RefObject<WebSocket | null>, setToken, setGameState: Dispatch<SetStateAction<GameState>>) {
  console.log(message.type)
  if (websocket.current === null) {
    console.log("null socket wtf?")
    return
  }
  switch (message.type) {
    case "error": {
      console.error(message.body.message)
      websocket.current = null
      setToken(null)
      break
    }
    case "gameState": {
      const receivedGameState = message.body
      if (receivedGameState == null) {
        return
      }

      setGameState(updateGameState(receivedGameState, false))
      if (receivedGameState.gameState.started) {
        setAppState(States.Game)
      }
      else {
        setAppState(States.Lobby)
      }

      break
    }
    case "started": {
      setAppState(States.Game)
      const message: WSMessage = { type: ClientMessageTypes.GetState, body: null }
      websocket.current.send(JSON.stringify(message))
      break
    }
    case "playerInfo": {
      console.log("hit player info")
      switch (message.body.action) {
        case "connected": {
          const players = message.body.players
          setGameState(prevState => ({
            ...prevState,
            players: players
          }))
          break
        }
        case "disconnected": {
          const playerID = message.body.player
          setGameState(prevState => {
            const updatedPlayers = [...prevState.players]
            const player = updatedPlayers.at(playerID)
            if (player === undefined) {
              console.log("Disconnected handler: Player is null")
              return prevState
            }
            player.connected = false
            console.log(updatedPlayers)
            return {
              ...prevState,
              players: updatedPlayers
            }
          })
        }

      }
      break
    }
    case "ended": {
      console.log("clearing cache")
      websocket.current.close()
      setToken(null)
      setGameState(defaultState)
      setAppState(States.CharacterCreation)
      localStorage.clear()
    }
  }
}
export function connectWS(token: string, setToken: Dispatch<string | null>): WebSocket {
  const ws = new WebSocket(`http://localhost:8080/ws?token=${token}`)
  ws.onopen = () => {
    console.log("Ws connected.")
  }
  ws.onclose = () => {
    console.log("Ws disconnected")
    setToken(null)
  }
  return ws
}
export function AttachClientMessageHandler(ws: RefObject<WebSocket | null>, setAppState: Dispatch<StateKeys>, setToken: Dispatch<string | null>, setGameState: Dispatch<GameState>) {
  if (ws.current === null) {
    console.log("null socket in attach")
    return
  }
  ws.current.onmessage = (event) => {
    try {
      const msg = parseWSMessages(event.data)
      if (msg === null) {
        return
      }
      handleWSMessages(msg, setAppState, ws, setToken, setGameState)
    } catch (e) {
      console.error(e)
    }
  }
}

