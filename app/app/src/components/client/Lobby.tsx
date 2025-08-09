import { useContext } from "react"
import { AppContext } from "../../store/gamestate-context"
import "../../styles/player.css"
import ClientPlayer from "./ClientPlayer"


export default function Lobby() {
  const state = useContext(AppContext)
  return (<div id="lobby">
    <h1 id="meet">Meet the citizens!</h1>
    <ul id="players">
      {state.players.map((p) => {
        return ClientPlayer(p)
      })}
    </ul>
  </div>)
}
