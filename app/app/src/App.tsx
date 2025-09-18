import { useEffect } from 'react'
import './App.css'
import { defaultState, defaultVote, States } from './types/types'
import { connectWS } from './services/ClientWS.ts'
import { AppContext } from './store/gamestate-context'
import CharacterForm from './components/client/CharacterForm'
import Lobby from './components/client/Lobby'
import Header from './components/client/Header'
import GameScreen from './components/client/GameScreen'
import { Toaster } from 'react-hot-toast'
import { WebSocketProvider } from './services/WSProvider.tsx'
import { useGameInfo } from './hooks/useGameInfo.ts'
import { useSetup } from './hooks/useSetup.ts'


export default function App() {

  const setup = useSetup()
  const GameInfoHandle = useGameInfo()

  useEffect(() => {
    const websocket = setup.data.websocket
    if (setup.data.token === null) {
      setup.setters.setAppState(States.CharacterCreation)
      GameInfoHandle.setters.setGameState(defaultState)
      GameInfoHandle.setters.setVote(defaultVote)

      return
    }
    if (websocket.current && websocket.current.readyState !== WebSocket.CLOSED) {
      websocket.current.close()
    }
    websocket.current = connectWS(setup.data.token, setup.setters.setToken, setup.setters.setAppState,
      GameInfoHandle.setters.setGameState,
      GameInfoHandle.setters.setMe, GameInfoHandle.setters.setVote)
    console.log("WEBSOCKET CURRENT: ", websocket.current)
    localStorage.setItem("token", setup.data.token)
  }, [setup.data.websocket, setup.data.token, setup.setters, GameInfoHandle.setters])


  const toRender = () => {
    const appState = setup.data.appState
    switch (appState) {
      case States.Loading: {
        return <><Header state={appState} /><main><h1>Loading...</h1></main></>
      };
      case States.CharacterCreation: {
        return <><Header state={appState} /><main><CharacterForm setToken={setup.setters.setToken} /></main></>;
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
    <WebSocketProvider wsRef={setup.data.websocket}>
      <AppContext.Provider value={GameInfoHandle.gameInfo}>
        <Toaster position='bottom-right' />
        {toRender()}
      </AppContext.Provider>
    </WebSocketProvider >
  </>)
}

