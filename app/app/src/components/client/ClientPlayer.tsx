import type { Player } from "../../types/types";

export default function ClientPlayer(player: Player) {
  console.log(player.connected)
  return (
    <li className={`player ${player.connected ? "" : "disconnected"}`} key={player.id}>
      <div className="player-avatar">
        <div className="avatar-circle">
          {player.firstName.at(0)}{player.lastName.at(0)}
        </div>
      </div>
      <div className="citizenName">
        <h3>{player.firstName}</h3>
        <h3>{player.lastName}</h3>
      </div>
      <h4>{player.occupation}</h4>
    </li>
  )
}
