import { useState, useContext } from "react";
import type { Player } from "../../types/types";
import "./GameScreen.css"
import { AppContext } from "../../store/gamestate-context";
import ClientPlayer from "./ClientPlayer";
import VotingModal from "./Vote";


export default function GameScreen() {
  const state = useContext(AppContext);
  const vote = state.vote
  if (state.me === null) {
    return
  }

  const handlePlayerClick = (player: Player) => {
  };


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

  return (<div className="game-screen">
    <div className="game-header">
      <div className="phase-info">
        <h2 style={{ color: getPhaseColor() }}>{getPhaseText()}</h2>
      </div>
    </div>
    <div className="game-content">
      <ul id="players">
        {state.gameState.players.map((player) => {
          return ClientPlayer(player, player.id === state.me.id)
        })}
      </ul>
      <VotingModal players={state.gameState.players} vote={vote} me={state.me} />
    </div>
  </div>
  )
}
// TODO: Voting should be a popup like in among us, that would open and close afterwards
// TODO: Add microphone
