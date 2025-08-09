import { useEffect, useRef, useState } from 'react'
import './App.css'
import { defaultState, States, type GameState, type StateKeys } from './types/types'
import { AttachClientMessageHandler, connectWS } from './services/ClientWS.ts'
import { AppContext } from './store/gamestate-context'
import CharacterForm from './components/client/CharacterForm'
import Lobby from './components/client/Lobby'
import Header from './components/client/Header'
import GameScreen from './components/client/GameScreen'

export default function App() {

  // TODO: Make it into custom hook maybe
  const [appState, setAppState] = useState<StateKeys>(States.Lobby)
  const websocket = useRef<WebSocket | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [gameState, setGameState] = useState<GameState>(defaultState)

  useEffect(() => {
    if (token === null) {
      setAppState(States.CharacterCreation)
      return
    }
    websocket.current = connectWS(token, setToken)
    console.log("WEBSOCKET CURRENT: ", websocket.current)
    AttachClientMessageHandler(websocket, setAppState, setToken, setGameState)
    localStorage.setItem("token", token)
  }, [token])


  const toRender = () => {
    switch (appState) {
      case States.Loading: return <><Header state={appState} /><main><h1>Loading...</h1></main></>;
      case States.CharacterCreation: return <><Header state={appState} /><main><CharacterForm setToken={setToken} /></main></>;
      case States.Lobby: return <><Header state={appState} /><main><Lobby /></main></>;
      case States.Game: return <GameScreen />
    }
  }

  return (<>
    <AppContext.Provider value={gameState}>
      {toRender()}
    </AppContext.Provider>
  </>)
}

