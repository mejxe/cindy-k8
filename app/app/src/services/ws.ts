import type { GameStateBody, ParsedWSMessage } from "../types/messageTypes"
import { States, type AppStateType, type Player } from "../types/types"

const temporaryPlayer1: Player = { firstName: "ziutek", lastName: "mualla", occupation: "zjadacz", id: 1, alive: true, syndicate: false }

const temporaryPlayer2: Player = { firstName: "ksiazulo", lastName: "mualla", occupation: "zjadacz", id: 1, alive: true, syndicate: false }

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


      setGameState(updateGameState(receivedGameState, false))

      break
    }
    //case "started": {
    //  setAppState(States.Game)
    //  break
    //}
  }
}
function updateGameState(receivedGameState: GameStateBody, forGM: boolean): AppStateType {
  const updatedGameState: AppStateType = {
    players: [temporaryPlayer1, temporaryPlayer2],
    round: receivedGameState.gameState.round,
    numPlayersAlive: receivedGameState.gameState.numPlayersAlive,
    night: receivedGameState.gameState.night,
    started: receivedGameState.gameState.started,
    holdingMic: null
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
export function connectWS(token: string, websocket, setAppState, setToken, setGameState) {
  const ws = new WebSocket(`http://localhost:8080/ws?token=${token}`)
  ws.onopen = () => {
    console.log("Ws connected.")
    setAppState(States.Lobby)
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
    setAppState(States.CharacterCreation)
    setToken(null)
  }
}

export function parseWSMessages(jsonString: string): ParsedWSMessage | null {
  // TODO: make not nullable eventually
  console.log("parsing")
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
