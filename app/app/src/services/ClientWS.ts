import { useEffect, type Dispatch, type RefObject, type SetStateAction } from "react"
import { ClientMessageTypes, type GameStateMessage, type ParsedWSMessage, type WSMessage } from "../types/messageTypes"
import { defaultState, defaultVote, States, type GameState, type Player, type StateKeys, type Vote } from "../types/types"
import { parseWSMessages, sendGSRequest, sendRequest, updateGameState } from "./shared"
import toast from "react-hot-toast"


export function handleWSMessages(message: ParsedWSMessage,
  setAppState,
  websocket: WebSocket | null,
  setToken,
  setGameState: Dispatch<SetStateAction<GameState>>,
  setMe: Dispatch<SetStateAction<Player | null>>,
  setVote: Dispatch<SetStateAction<Vote>>,
  setTimer: Dispatch<number>,
  setRoleRevealed: Dispatch<boolean>
) {
  console.log(message.type)
  if (websocket === null) {
    console.log("null socket wtf?")
    return
  }
  const clear = () => {
    if (websocket !== null) {
      websocket.close()
    }
    websocket = null
    setGameState(defaultState)
    setAppState(States.CharacterCreation)
    setVote(defaultVote)
    setRoleRevealed(false)
    localStorage.clear()

  }
  switch (message.type) {
    case "error": {
      console.error(message.body.message)
      clear()
      setToken(null)
      break
    }
    case "gameState": {
      const receivedGameState = message.body
      if (receivedGameState == null) {
        return
      }

      setGameState(updateGameState(receivedGameState))
      if (receivedGameState.gameState.started) {
        setAppState(States.Game)
      }
      else {
        setAppState(States.Lobby)
      }

      break
    }
    case "started": {
      let time = 5
      setTimer(time)
      const timer = setInterval(() => {
        time -= 1
        setTimer(time)
        if (time <= 0) {
          clearInterval(timer)
          sendGSRequest(websocket)
          sendRequest(websocket, ClientMessageTypes.GetMe, null)
        }
      }, 1000)
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
      setVote(() => ({
        ...defaultVote,
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
      setVote(() => ({
        ...newVote
      }))
      break
    }
    case "voteSummary": {
      const result = message.body
      setGameState(prevState => {
        if (result.eliminated === null) {
          toast("Vote aborted by GameMaster!")
          return { ...prevState, started: false }
        }

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
          return { ...prevState, started: false }
        }

        const updatedPlayers = [...prevState.players]
        const player = updatedPlayers.find(p => p.id === result.eliminated[0])
        if (player === undefined) {
          console.error("Vote Summary: Player is null")
          return { ...prevState, started: false }
        }
        player.alive = false
        toast(`${player.firstName} ${player.lastName} is eliminated with ${result.amountOfVotes} vote(s). Goodbye!`, {})
        return {
          ...prevState,
          started: false,
          players: updatedPlayers
        }
      })
      setVote(() => ({
        ...defaultVote,
      }))
      break
      sendGSRequest(websocket)
    }
  }
}
export function connectWS(token: string, setToken: Dispatch<string | null>,
  setAppState: Dispatch<StateKeys>,
  setGameState: Dispatch<SetStateAction<GameState>>,
  setMe: Dispatch<Player | null>,
  setVote: Dispatch<Vote>, setTimer: Dispatch<number>,
  setRoleRevealed: Dispatch<boolean>): WebSocket {
  const host = window.location.hostname === 'localhost'
    ? 'localhost'
    : window.location.hostname;
  const ws = new WebSocket(`ws://${host}:8080/ws?token=${token}`)
  ws.onopen = () => {
    console.log("Ws connected.")
    AttachClientMessageHandler(ws, setAppState, setToken, setGameState, setMe, setVote, setTimer, setRoleRevealed)
    sendGSRequest(ws)
  }
  ws.onclose = () => {
    console.log("Ws disconnected")
    setToken(null)
  }
  return ws
}
export function AttachClientMessageHandler(ws: WebSocket,
  setAppState: Dispatch<StateKeys>,
  setToken: Dispatch<string | null>,
  setGameState: Dispatch<SetStateAction<GameState>>,
  setMe: Dispatch<Player | null>,
  setVote: Dispatch<Vote>,
  setTimer: Dispatch<number>,
  setRoleRevelead: Dispatch<boolean>

) {
  ws.onmessage = (event) => {
    try {
      const msg = parseWSMessages(event.data)
      if (msg === null) {
        return
      }
      handleWSMessages(msg, setAppState, ws, setToken, setGameState, setMe, setVote, setTimer, setRoleRevelead)
    } catch (e) {
      console.error(e)
    }
  }
  console.log("attached the ws")
  console.log(ws)
}

