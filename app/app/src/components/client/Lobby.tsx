import { useContext } from "react"
import playerImg from "../../assets/player.png"
import { AppContext } from "../../store/gamestate-context"
import type { Player } from "../../types/types"


export default function Lobby() {
  const state = useContext(AppContext)
  console.log(state)
  return (<div id="lobby">
    <h1 id="meet">Meet the citizens!</h1>
    <div id="players">
      {state.players.map((p) => {
        return Player(p)
      })}
    </div>
  </div>)
}
function Player(player: Player) {
  return (
    <div className="player">
      <img src={playerImg} />
      <div className="citizenName">
        <h3>{player.firstName}</h3>
        <h3>{player.lastName}</h3>
      </div>
      <h4>{player.occupation}</h4>
    </div>
  )
}
