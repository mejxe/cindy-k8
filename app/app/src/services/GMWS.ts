import type { ParsedWSMessage } from "../types/messageTypes"
import { parseWSMessages } from "./shared.ts"
import { updateGameState } from "./shared"


export function connectWSForGM(password: string, setVerified, setWS, setGameState) {
  const ws = new WebSocket(`http://localhost:8080/gm?password=${password}`)
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
      handleGMMessages(msg, setGameState)
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
function handleGMMessages(message: ParsedWSMessage, setGameState) {
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
    case "error":
  }
}
