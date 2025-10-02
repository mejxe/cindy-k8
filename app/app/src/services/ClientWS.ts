import { ClientMessageTypes, type ParsedWSMessage } from "../types/messageTypes"
import { defaultState, defaultSummary, defaultVote, States, type Player } from "../types/types"
import { parseWSMessages, sendGSRequest, sendRequest, updateGameState } from "./shared"
import toast from "react-hot-toast"
import type { Setup } from "../hooks/useSetup"
import type { GameInfoHandle } from "../hooks/useGameInfo"


export function handleWSMessages(message: ParsedWSMessage, setup: Setup, gameInfoHandle: GameInfoHandle) {
  let websocket = setup.data.websocket.current
  console.log("message in wsmessages: ", message)
  console.log("Players in handlewsmsgs", gameInfoHandle.gameInfo.gameState.players)
  if (websocket === null) {
    return
  }
  const clear = () => {
    if (websocket !== null) {
      websocket.close()
    }
    websocket = null
    gameInfoHandle.setters.setGameState(defaultState)
    setup.setters.setAppState(States.CharacterCreation)
    gameInfoHandle.setters.setVote(defaultVote)
    setup.setters.setRoleRevealed(false)
    localStorage.clear()

  }
  switch (message.type) {
    case "error": {
      console.error(message.body.message)
      clear()
      setup.setters.setToken(null)
      break
    }
    case "gameState": {
      const receivedGameState = message.body
      if (receivedGameState == null) {
        return
      }

      gameInfoHandle.setters.setGameState(updateGameState(receivedGameState))
      if (receivedGameState.gameState.started) {
        setup.setters.setAppState(States.Game)
      }
      else {
        setup.setters.setAppState(States.Lobby)
      }

      break
    }
    case "started": {
      setup.timer.callIn5Seconds(() => {
        if (websocket === null) return
        sendGSRequest(websocket)
        sendRequest(websocket, ClientMessageTypes.GetMe, null)
      })
      break
    }
    case "playerInfo": {
      switch (message.body.action) {
        case "connected": {
          const players = message.body.players
          gameInfoHandle.setters.setGameState(prevState => ({
            ...prevState,
            players: players
          }))
          break
        }
        case "disconnected": {
          const playerID = message.body.player
          gameInfoHandle.setters.setGameState(prevState => {
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
      gameInfoHandle.setters.setGameState(prevState => {
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
      gameInfoHandle.setters.setMe(prevMe => {
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
          setup.setters.setToken(null)
          return null
        }
        return prevMe
      })
      gameInfoHandle.setters.setGameState(prevState => {
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
      let syndicates: Player[] = []
      console.log(message.body)
      gameInfoHandle.setters.setGameState(prevState => {
        syndicates = message.body.syndicates.map(id => prevState.players.find(p => p.id === id)).filter(p => p !== undefined)
        setup.setters.setGameSummaryData({ syndicates, syndicateWins: message.body.syndicateWins })
        setup.gameSummary.setGameSummaryOn(true)
        return prevState
      })
      clear()
      setup.setters.setToken(null)
      break
    }
    case "voteStarted": {
      gameInfoHandle.setters.setVote(() => ({
        ...defaultVote,
        voteOn: true
      })
      )
      break

    }
    case "id": {
      const me: Player = message.body
      gameInfoHandle.setters.setMe(me)
      break
    }
    case "voteUpdate": {
      const newVote = message.body
      gameInfoHandle.setters.setVote(() => ({
        ...newVote
      }))
      break
    }
    case "voteSummary": {
      const result = message.body
      gameInfoHandle.setters.setGameState(prevState => {
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
          setup.setters.setSummary({ ...defaultSummary, playerKilled: null, summaryOn: true })
          setup.timer.callIn5Seconds(() => {
            setup.setters.setSummary(defaultSummary)
          })
          return { ...prevState, started: false }
        }

        const updatedPlayers = [...prevState.players]
        const player = updatedPlayers.find(p => p.id === result.eliminated[0])
        if (player === undefined) {
          console.error("Vote Summary: Player is null")
          return { ...prevState, started: false }
        }
        player.alive = false
        setup.setters.setSummary({ ...defaultSummary, playerKilled: player, summaryOn: true })
        setup.timer.callIn5Seconds(() => {
          setup.setters.setSummary(defaultSummary)
        })
        return {
          ...prevState,
          started: false,
          players: updatedPlayers
        }
      })
      gameInfoHandle.setters.setVote(() => ({
        ...defaultVote,
      }))
      sendGSRequest(websocket)
      break
    }
  }
}
export function connectWS(
  setup: Setup,
  gameInfoHandle: GameInfoHandle
): WebSocket {
  const host = window.location.hostname === 'localhost'
    ? 'localhost'
    : window.location.hostname;
  const ws = new WebSocket(`ws://${host}:8080/ws?token=${setup.data.token}`)
  ws.onopen = () => {
    console.log("Ws connected.")
    AttachClientMessageHandler(setup, gameInfoHandle)
    sendGSRequest(ws)
  }
  ws.onclose = () => {
    console.log("Ws disconnected")
    setup.setters.setToken(null)
  }
  return ws
}
export function AttachClientMessageHandler(
  setup: Setup,
  gameInfoHandle: GameInfoHandle
) {
  if (setup.data.websocket.current == null) return
  setup.data.websocket.current.onmessage = (event) => {
    try {
      const msg = parseWSMessages(event.data)
      if (msg === null) {
        return
      }
      const gmInfoData = gameInfoHandle.gameInfo
      handleWSMessages(msg, setup, { ...gameInfoHandle, gameInfo: gmInfoData })
    } catch (e) {
      console.error(e)
    }
  }
}

