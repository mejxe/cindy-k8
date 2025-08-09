import { useState } from "react"
import Login from "./Login"
import "../../styles/form.css"
import { defaultState } from "../../types/types"
import PlayerList from "./PlayerList"
import GameState from "./GameState"

export default function GMPanel() {
  const [verified, setVerified] = useState(false)
  const [ws, setWS] = useState<WebSocket | null>(null)
  const [gameState, setGameState] = useState(defaultState)
  const toRender = () => {
    switch (verified) {
      case true: {
        if (ws === null) { return }
        return (<div>
          <PlayerList players={gameState.players} />
          <GameState ws={ws} gamestate={gameState} />
        </div>)
      }
      case false: {
        return (<>
          <Login setVerified={setVerified} setWS={setWS} setGameState={setGameState} gameState={gameState} />
        </>)
      }
    }
  }
  return (<>
    {toRender()}
  </>)

}
