import type { GameInfo, Player, Vote } from "../../types/types";
import "../../styles/player.css"
import "../admin/PlayerList.css"
import { sendRequest } from "../../services/shared";
import { GMMessageTypes } from "../../types/messageTypes";

export default function PlayerList({ gameInfo, ws }: { gameInfo: GameInfo, ws: WebSocket }) {
  const state = gameInfo.gameState
  const players = state.players
  const vote = gameInfo.vote
  const manipulatePlayer = (playerID: number, action: string) => {
    const body = { "playerID": playerID, action }
    sendRequest(ws, GMMessageTypes.Manipualte, body)
  }
  return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><h1>Player List</h1>
    < ul id="players">
      {players.map((p) => {
        return Player(p, state.started, manipulatePlayer, vote)
      })}
    </ul>
  </div>)
}

function Player(player: Player, started: boolean, manipulatePlayer: (playerID: number, action: string) => void, vote: Vote) {
  const getPlayerClasses = () => {
    let classes = "player"
    if (!player.alive) classes += " dead"
    if (!player.connected) classes += " disconnected"
    if (vote.currentlyVoting === player.id) classes += " voting"
    if (vote.alreadyVoted.has(player.id)) classes += " alreadyVoted"
    return classes
  }
  const voteCount = vote.votes.get(player.id) !== undefined ? vote.votes.get(player.id) : "0"
  return (
    <li key={player.id} className={getPlayerClasses()}>
      <h2>{player.id}</h2>
      {vote.voteOn && <h3 className="voteCount">{voteCount}</h3>}
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

