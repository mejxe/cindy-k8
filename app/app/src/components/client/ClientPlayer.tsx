import type { Player } from "../../types/types";

export default function ClientPlayer(player: Player, me: boolean) {
  return (
    <li className={`player ${me ? "me" : ""}${player.alive ? "" : "dead"} ${player.connected ? "" : "disconnected"}`} key={player.id}>
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
