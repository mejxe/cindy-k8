import type { Dispatch, RefObject, SetStateAction } from "react"
import { ClientMessageTypes, type GameStateMessage, type ParsedWSMessage, type WSMessage } from "../types/messageTypes"
import { defaultState, defaultVote, States, type GameState, type Player, type StateKeys, type Vote } from "../types/types"
import { parseWSMessages, updateGameState } from "./shared"
import toast from "react-hot-toast"
import PlayerList from "../components/admin/PlayerList"


export function handleWSMessages(message: ParsedWSMessage,
  setAppState,
  websocket: RefObject<WebSocket | null>,
  setToken,
  setGameState: Dispatch<SetStateAction<GameState>>,
  setMe: Dispatch<SetStateAction<Player | null>>,
  setVote: Dispatch<SetStateAction<Vote>>
) {
  console.log(message.type)
  if (websocket.current === null) {
    console.log("null socket wtf?")
    return
  }
  const clear = () => {
    if (websocket.current !== null) {
      websocket.current.close()
    }
    websocket.current = null
    setGameState(defaultState)
    setAppState(States.CharacterCreation)
    setVote(defaultVote)
    localStorage.clear()

  }
  switch (message.type) {
    case "error": {
      console.error(message.body.message)
      clear()
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
          clear()
          setToken(null)
          return null
        }
        return prevMe
      })
      setGameState(prevState => {
        const updatedPlayers = [...prevState.players]
        const player = updatedPlayers.find(p => p.id === playerID)
        if (player === undefined) {
          console.log("Kicked handler: Player is null")
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
      clear()
      setToken(null)
      break
    }
    case "voteStarted": {
      setVote(prevVote => ({
        ...prevVote,
        voteOn: true
      })
      )
      break

    }
    case "id": {
      const me: Player = message.body
      setMe(me)
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
      const result = message.body
      setGameState(prevState => {

        if (result.eliminated.length > 1) {
          const msg = result.eliminated.map((val) => {
            const player = prevState.players.find(p => p.id === val)
            if (player === undefined) {
              console.error("Vote Summary: Error while searching for player")
              return ""
            }
            return player.firstName + " " + player.lastName
          })
          msg.join(", ")
          toast(`The vote is tied! ${msg} all have ${result.amountOfVotes} vote(s)`, {})
          return prevState
        }

        const updatedPlayers = [...prevState.players]
        const player = updatedPlayers.find(p => p.id === result.eliminated[0])
        if (player === undefined) {
          console.error("Vote Summary: Player is null")
          return prevState
        }
        player.alive = false
        toast(`${player.firstName} ${player.lastName} is eliminated with ${result.amountOfVotes} vote(s). Goodbye!`, {})
        return {
          ...prevState,
          players: updatedPlayers
        }
      })
      setVote(prevVote => ({
        ...prevVote,
        voteOn: false,
      }))
      break
    }
  }
}
export function connectWS(token: string, setToken: Dispatch<string | null>): WebSocket {
  const host = window.location.hostname === 'localhost'
    ? 'localhost'
    : window.location.hostname;
  const ws = new WebSocket(`http://${host}:8080/ws?token=${token}`)
  ws.onopen = () => {
    console.log("Ws connected.")
  }
  ws.onclose = () => {
    console.log("Ws disconnected")
    setToken(null)
  }
  return ws
}
export function AttachClientMessageHandler(ws: RefObject<WebSocket | null>,
  setAppState: Dispatch<StateKeys>,
  setToken: Dispatch<string | null>,
  setGameState: Dispatch<SetStateAction<GameState>>,
  setMe: Dispatch<Player | null>,
  setVote: Dispatch<Vote>

) {
  console.log("in the attach!")
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
      handleWSMessages(msg, setAppState, ws, setToken, setGameState, setMe, setVote)
    } catch (e) {
      console.error(e)
    }
  }
}

