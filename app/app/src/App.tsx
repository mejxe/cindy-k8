import { useEffect, useRef, useState } from 'react'
import './App.css'
import { defaultState, defaultVote, States, type GameInfo, type GameState, type Player, type StateKeys, type Vote } from './types/types'
import { AttachClientMessageHandler, connectWS } from './services/ClientWS.ts'
import { AppContext } from './store/gamestate-context'
import CharacterForm from './components/client/CharacterForm'
import Lobby from './components/client/Lobby'
import Header from './components/client/Header'
import GameScreen from './components/client/GameScreen'
import { Toaster } from 'react-hot-toast'
import { WebSocketProvider } from './services/WSProvider.tsx'
import type { WSMessage } from './types/messageTypes.ts'


export default function App() {

  // TODO: Make it into custom hook maybe
  const [appState, setAppState] = useState<StateKeys>(States.Lobby)
  const websocket = useRef<WebSocket | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [gameState, setGameState] = useState<GameState>(defaultState)
  const [me, setMe] = useState<Player | null>(null)
  const [vote, setVote] = useState<Vote>(defaultVote)
  const gameInfo: GameInfo = { gameState, me, vote }

  useEffect(() => {
    if (token === null) {
      setAppState(States.CharacterCreation)
      return
    }
    websocket.current = connectWS(token, setToken)
    AttachClientMessageHandler(websocket, setAppState, setToken, setGameState, setMe, setVote)
    console.log("WEBSOCKET CURRENT: ", websocket.current)
    localStorage.setItem("token", token)
  }, [token])


  const toRender = () => {
    switch (appState) {
      case States.Loading: {
        return <><Header state={appState} /><main><h1>Loading...</h1></main></>
      };
      case States.CharacterCreation: {
        return <><Header state={appState} /><main><CharacterForm setToken={setToken} /></main></>;
      }
      case States.Lobby: {
        return <><Header state={appState} /><main><Lobby /></main></>;
      }
      case States.Game: {
        return <GameScreen />
      }
    }
  }

  return (<>
    <WebSocketProvider wsRef={websocket}>
      <AppContext.Provider value={gameInfo}>
        <Toaster position='bottom-right' />
        {toRender()}
      </AppContext.Provider>
    </WebSocketProvider >
  </>)
}

