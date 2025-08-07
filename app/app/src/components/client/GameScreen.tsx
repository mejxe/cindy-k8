import { useState, useContext } from "react";
import type { Player } from "../../types/types";
import "./GameScreen.css"
import { AppContext } from "../../store/gamestate-context";
import ClientPlayer from "./ClientPlayer";


export default function GameScreen() {
  const state = useContext(AppContext);

  const handlePlayerClick = (player: Player) => {
  };


  const getPhaseText = () => {
    switch (state.night) {
      case true: return `🌙 Night ${state.round}`;
      case false: return `☀️ Day ${state.round}`;
      default: return "Game in progress...";
    }
  };

  const getPhaseColor = () => {
    switch (state.night) {
      case true: return "#4a5568";
      case false: return "#d4af37";
      default: return "#d4af37";
    }
  };

  return (<div className="game-screen">
    <div className="game-header">
      <div className="phase-info">
        <h2 style={{ color: getPhaseColor() }}>{getPhaseText()}</h2>
        <div className="timer">
        </div>
      </div>
    </div>

    <div className="game-content">
      <ul id="players">
        {state.players.map((player) => {
          return ClientPlayer(player)
        })}
      </ul>
    </div>
  </div>
  )
}
// TODO: Clean up syncing states
// TODO: Voting should be a popup like in among us, that would open and close afterwards
// TODO: Add microphone
