import { useEffect, useState } from "react"
import Login from "./Login"
import "../../styles/form.css"
import { defaultState, defaultVote, type GameInfo } from "../../types/types"
import PlayerList from "./PlayerList"
import GameState from "./GameState"

export default function GMPanel() {
  const [verified, setVerified] = useState(false)
  const [ws, setWS] = useState<WebSocket | null>(null)
  const [gameState, setGameState] = useState(defaultState)
  const [vote, setVote] = useState(defaultVote)
  const gameInfo: GameInfo = {
    gameState: gameState,
    vote: vote,
    me: null,
  }
  useEffect(() => {
    if (ws == null) {
      setGameState(defaultState)
      setVote(defaultVote)
    }
  }, [ws])

  const toRender = () => {
    switch (verified) {
      case true: {
        if (ws === null) { return }
        return (<div>
          <PlayerList ws={ws} state={gameState} />
          <GameState ws={ws} gameInfo={gameInfo} />
        </div>)
      }
      case false: {
        return (<>
          <Login setVerified={setVerified} setWS={setWS} setGameState={setGameState} gameState={gameState} setVote={setVote} />
        </>)
      }
    }
  }
  return (<>
    {toRender()}
  </>)

}

