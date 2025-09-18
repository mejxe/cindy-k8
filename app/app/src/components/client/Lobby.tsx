import { useContext } from "react"
import { AppContext } from "../../store/gamestate-context"
import "../../styles/player.css"
import ClientPlayer from "./ClientPlayer"


export default function Lobby({ time }: { time: number }) {
  const state = useContext(AppContext)
  return (<div id="lobby">
    <h1 id="meet">Meet the citizens!</h1>
    {time > 0 && <h2>Game will start in {time}!</h2>}
    <ul id="players">
      {state.gameState.players.map((p) => {
        return ClientPlayer(p, state.me, null)
      })}
    </ul>
  </div>)
}
