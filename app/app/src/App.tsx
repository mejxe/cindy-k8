import { useEffect, useRef, useState } from 'react'
import './App.css'
import { defaultState, States, type AppStateType, type StateKeys } from './types/types'
import { connectWS } from './services/ClientWS.ts'
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
  const [gameState, setGameState] = useState<AppStateType>(defaultState)

  useEffect(() => {
    if (token === null) {
      setAppState(States.CharacterCreation)
      return
    }
    connectWS(token, websocket, setAppState, setToken, setGameState)
    // TODO: Figure out why is this null
    console.log("WEBSOCKET CURRENT: ", websocket.current)
    localStorage.setItem("token", token)
  }, [token])

  // TODO: Figure out better way to change the app state
  useEffect(() => {
    if (token === null) return
    switch (gameState.started) {
      case true: {
        setAppState(States.Game)
        break
      }
      case false: {
        setAppState(States.Lobby)
      }
    }
  }, [gameState, token])

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

