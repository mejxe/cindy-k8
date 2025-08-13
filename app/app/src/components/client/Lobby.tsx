import { useContext } from "react"
import { AppContext } from "../../store/gamestate-context"
import "../../styles/player.css"
import ClientPlayer from "./ClientPlayer"


export default function Lobby() {
  const state = useContext(AppContext)
  console.log(state)
  return (<div id="lobby">
    <h1 id="meet">Meet the citizens!</h1>
    <ul id="players">
      {state.gameState.players.map((p) => {
        const me = p.id == state.me?.id
        return ClientPlayer(p, me)
      })}
    </ul>
  </div>)
}
