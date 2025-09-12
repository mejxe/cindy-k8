import { useContext } from "react";
import type { Player } from "../../types/types";
import "./GameScreen.css"
import { AppContext } from "../../store/gamestate-context";
import ClientPlayer from "./ClientPlayer";
import VotingModal from "./Vote";
import { useWebSocket } from "../../hooks/useWebSocket";
import { ClientMessageTypes, type WSMessage } from "../../types/messageTypes";
import "./Vote.css"


export default function GameScreen() {
  const state = useContext(AppContext);
  const vote = state.vote
  const ws = useWebSocket()
  if (state.me === null) {
    return
  }
  const getVoteCount = (player: Player): number => {
    if (vote.votes.size == 0) return 0
    const votes = vote.votes.get(player.id)
    if (votes === undefined) {
      console.log("Cannot correctly index player in vote count")
      return 0
    }
    return votes
  }

  const getPhaseText = () => {
    switch (state.gameState.night) {
      case true: return `🌙 Night ${state.gameState.round}`;
      case false: return `☀️ Day ${state.gameState.round}`;
      default: return "Game in progress...";
    }
  };

  const getPhaseColor = () => {
    switch (state.gameState.night) {
      case true: return "#4a5568";
      case false: return "#d4af37";
      default: return "#d4af37";
    }
  };
  const voteToKill = (player: Player) => {
    if (player.syndicate || !player.alive) {
      return
    }
    if (state.gameState.night && state.me?.syndicate) {
      const msg: WSMessage = { type: ClientMessageTypes.VoteToKill, body: { "kill": player.id } }
      ws.sendMessage(msg)
    }
  }

  return (<div className="game-screen">
    <div className="game-header">
      <div className="phase-info">
        <h2 style={{ color: getPhaseColor() }}>{getPhaseText()}</h2>
      </div>
    </div>
    <div className="game-content">
      <ul id="players">
        {state.gameState.players.map((player) => {
          if (state.gameState.night && state.me?.syndicate && !player.syndicate && player.alive) {
            return (<div className="voting-player-container">{ClientPlayer(player, state.me,
              () => { voteToKill(player) }, getVoteCount(player))}
              {
                getVoteCount(player) > 0 && (
                  <div className="vote-count">
                    {getVoteCount(player)}
                  </div>
                )
              }</div>)


          } else {
            return ClientPlayer(player, state.me, null, 0)
          }
        })}
      </ul>
      <VotingModal players={state.gameState.players} vote={vote} me={state.me} />
    </div>
  </div>
  )
}
// TODO: Add microphone
