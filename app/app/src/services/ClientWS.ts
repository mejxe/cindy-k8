import type { Ref } from "react"
import type { ParsedWSMessage } from "../types/messageTypes"
import { defaultState, States } from "../types/types"
import { parseWSMessages, updateGameState } from "./shared"


export function handleWSMessages(message: ParsedWSMessage, setAppState, websocket, setToken, setGameState) {
  console.log(message.type)
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

      break
    }
    case "started": {
      setAppState(States.Game)
      break
    }
    case "ended": {
      console.log("clearing cache")
      websocket.current.close()
      setToken(null)
      setGameState(defaultState)
      localStorage.clear()
    }
  }
}
export function connectWS(token: string, websocket, setAppState, setToken, setGameState) {
  const ws = new WebSocket(`http://localhost:8080/ws?token=${token}`)
  ws.onopen = () => {
    console.log("Ws connected.")
    websocket.current = ws
  }
  ws.onmessage = (event) => {
    try {
      const msg = parseWSMessages(event.data)
      if (msg === null) {
        return
      }
      handleWSMessages(msg, setAppState, websocket, setToken, setGameState)
    } catch (e) {
      console.error(e)
    }
  }
  ws.onclose = () => {
    console.log("Ws disconnected")
    websocket.current = null
    setToken(null)
  }
}

