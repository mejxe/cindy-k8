import type { Player } from "../../types/types";
import "../../styles/player.css"

export default function PlayerList({ players }: { players: Player[] }) {
  return (<div><h1>Player List</h1>
    < ul id="players">
      {players.map((p) => {
        return Player(p)
      })}
    </ul>
  </div>)
}
function Player(player: Player) {
  return (
    <li className={player.alive ? "player" : "player dead"}>
      <h2>{player.id}</h2>
      <div className="citizenName">
        <h3>{player.firstName}</h3>
        <h3>{player.lastName}</h3>
      </div>
      <h4>{player.occupation}</h4>
      <div id="btns">
        <button>kick</button>
        <button>kill</button>
      </div>
    </li>
  )
}
