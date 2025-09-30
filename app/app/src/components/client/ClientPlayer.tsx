import type { Player } from "../../types/types";
import "./css/GameScreen.css"

export default function ClientPlayer(player: Player, me: Player, handlerFunc) {
  let avatarCircle = player.firstName.at(0) + player.lastName.at(0)
  const getClasses = () => {
    let classes = "player"
    if (player.id === me.id) {
      classes += " me"
      avatarCircle = "ME"
    }
    if (!player.alive) classes += " dead"
    if (!player.connected) classes += " disconnected"
    if (player.alive && !player.syndicate && me.syndicate) classes += " killable"
    return classes
  }
  return (
    <>
      <li key={player.id} onClick={handlerFunc} className={getClasses()}>
        <div className="player-avatar">
          <div className="avatar-circle">
            {avatarCircle}
          </div>
        </div>
        <div className="citizenName">
          <h3>{player.firstName}</h3>
          <h3>{player.lastName}</h3>
        </div>
        <h4>{player.occupation}</h4>
      </li>
    </>)
}
