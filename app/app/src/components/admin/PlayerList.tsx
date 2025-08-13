import type { GameState, Player } from "../../types/types";
import "../../styles/player.css"
import { sendRequest } from "../../services/shared";
import { GMMessageTypes } from "../../types/messageTypes";

export default function PlayerList({ state, ws }: { state: GameState, ws: WebSocket }) {
  const players = state.players
  const manipulatePlayer = (playerID: number, action: string) => {
    const body = { "playerID": playerID, action }
    sendRequest(ws, GMMessageTypes.Manipualte, body)
  }
  return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><h1>Player List</h1>
    < ul id="players">
      {players.map((p) => {
        return Player(p, state.started, manipulatePlayer)
      })}
    </ul>
  </div>)
}
function Player(player: Player, started: boolean, manipulatePlayer: (playerID: number, action: string) => void) {
  return (
    <li key={player.id} className={`${player.connected ? "" : "disconnected"} ${player.alive ? "player" : "player dead"}`}>
      <h2>{player.id}</h2>
      <div className="citizenName">
        <h3>{player.firstName}</h3>
        <h3>{player.lastName}</h3>
      </div>
      <h4>{player.occupation}</h4>
      {player.syndicate ? <h4 id="syndicate">Syndicate</h4> : null}
      <div id="btns">
        <button onClick={() => manipulatePlayer(player.id, "kick")}>kick</button>
        <button className={started ? "" : "disabled"} disabled={!started} onClick={() => manipulatePlayer(player.id, "kill")}>kill</button>
      </div>
    </li>
  )
}

