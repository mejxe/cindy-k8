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
import RoleReveal from './components/client/RoleReveal.tsx'
import useWakeLock from './hooks/useWakeLock.ts'


export default function App() {

  const setup = useSetup()
  const GameInfoHandle = useGameInfo()
  const wakeLock = useWakeLock()
  wakeLock.wakelockRequest()

  useEffect(() => {
    const websocket = setup.data.websocket

    if (setup.data.token === null) {
      setup.setters.setAppState(States.CharacterCreation)
      return
    }

    if (websocket.current && websocket.current.readyState !== WebSocket.CLOSED) {
      websocket.current.close()
    }

    websocket.current = connectWS(setup, GameInfoHandle)
    localStorage.setItem("token", setup.data.token)
  }, [setup.data.token])


  const toRender = () => {
    const appState = setup.data.appState
    switch (appState) {
      case States.CharacterCreation: {
        return <><Header state={appState} /><main><CharacterForm gameSummary={setup.gameSummary} setToken={setup.setters.setToken} /></main></>;
      }
      case States.Lobby: {
        return <><Header state={appState} /><main><Lobby time={setup.timer.timer} /></main></>;
      }
      case States.Game: {
        return setup.data.roleRevealed ? <GameScreen summary={setup.data.summary} timer={setup.timer.timer} /> : <RoleReveal setRoleRevealed={setup.setters.setRoleRevealed} />
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

