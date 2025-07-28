import { useContext } from "react"
import playerImg from "../assets/player.png"
import { AppContext } from "../store/gamestate-context"
import type { Player } from "../types/types"


export default function Lobby() {
  const state = useContext(AppContext)
  console.log(state)
  const Player = (player: Player) => {
    return (
      <div className="player">
        <img src={playerImg} />
        <h3>{player.firstName}</h3>
        <h3>{player.lastName}</h3>
        <h4>{player.occupation}</h4>
      </div>
    )
  }
  return <>{state.players.map((p) => {
    return Player(p)
  })}</>
}
