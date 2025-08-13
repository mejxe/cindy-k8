import type { Dispatch, RefObject, SetStateAction } from "react"
import { ClientMessageTypes, type GameStateMessage, type ParsedWSMessage, type WSMessage } from "../types/messageTypes"
import { defaultState, States, type GameState, type Player, type StateKeys } from "../types/types"
import { parseWSMessages, updateGameState } from "./shared"
import toast from "react-hot-toast"


export function handleWSMessages(message: ParsedWSMessage, setAppState, websocket: RefObject<WebSocket | null>, setToken, setGameState: Dispatch<SetStateAction<GameState>>, setMe: Dispatch<SetStateAction<Player | null>>) {
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
            const player = updatedPlayers.find(p => p.id === playerID)
            if (player === undefined) {
              console.log("Disconnected handler: Player is null")
              return prevState
            }
            player.connected = false
            return {
              ...prevState,
              players: updatedPlayers
            }
          })
        }

      }
      break
    }
    case "pkilled": {
      const playerID = message.body.whoDied
      setGameState(prevState => {
        const updatedPlayers = [...prevState.players]
        const player = updatedPlayers.find(p => p.id === playerID)
        if (player === undefined) {
          console.log("Eliminated handler: Player is null")
          return prevState
        }
        player.alive = false
        return {
          ...prevState,
          players: updatedPlayers
        }
      })
      break
    }
    case "kicked": {
      const playerID = message.body.who
      setMe(prevMe => {
        if (prevMe === null) return null
        if (prevMe.id === playerID) {
          toast.error("You have been kicked.", {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          })
          return null
        }
        return prevMe
      })
      setGameState(prevState => {
        const updatedPlayers = [...prevState.players]
        const player = updatedPlayers.find(p => p.id === playerID)
        if (player === undefined) {
          console.log("Eliminated handler: Player is null")
          return prevState
        }
        updatedPlayers.splice(playerID, 1)
        return {
          ...prevState,
          players: updatedPlayers
        }
      })
      break
    }
    case "ended": {
      console.log("clearing cache")
      websocket.current.close()
      setToken(null)
      setGameState(defaultState)
      setAppState(States.CharacterCreation)
      localStorage.clear()
      break
    }
    case "id": {
      const me: Player = message.body
      setMe(me)
      break
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
export function AttachClientMessageHandler(ws: RefObject<WebSocket | null>, setAppState: Dispatch<StateKeys>, setToken: Dispatch<string | null>, setGameState: Dispatch<SetStateAction<GameState>>, setMe: Dispatch<Player | null>) {
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
      handleWSMessages(msg, setAppState, ws, setToken, setGameState, setMe)
    } catch (e) {
      console.error(e)
    }
  }
}

