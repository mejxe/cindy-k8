import { sendRequest } from "../../services/shared";
import { GMMessageTypes } from "../../types/messageTypes";
import type { GameInfo, GameState } from "../../types/types";
import "./GameState.css"

export default function GameState({ gameInfo, ws }: { gameInfo: GameInfo, ws: WebSocket }) {
  const gamestate = gameInfo.gameState
  const vote = gameInfo.vote
  const night = gamestate.night ? "Nighttime" : "Daytime"
  const started = gamestate.started ? "started" : "Not started"
  const controls = getControlState(gamestate)


  const startVote = () => {
    sendRequest(ws, "startVote", null)
  }


  return (<div className="game-state">
    <h1>Control Panel</h1>

    <div className="game-controls">
      {/* Game Control */}
      <div className="control-group">
        <h4>
          Game Status
          <p className={`status-indicator ${gamestate.started ? 'status-started' : 'status-stopped'}`}>
            {started}
          </p>
        </h4>
        <button onClick={() => { sendRequest(ws, GMMessageTypes.Start, null) }} className={`control-btn ${!gamestate.started ? 'primary' : ''}`}>
          {controls.startControl.startButton.text}
        </button>
      </div>

      {/* Vote Control */}
      <div className={controls.voteControl.className}>
        <h4>
          Vote Control
          <p className={`status-indicator ${vote.voteOn ? 'status-vote-active' : 'status-vote-inactive'}`}>
            {vote.voteOn ? "Vote is ON" : "Vote is off"}
          </p>
        </h4>
        <div className="vote-buttons">
          <button onClick={startVote} className="control-btn vote-btn">
            Start Vote
          </button>
          <button onClick={() => { /* Handle open vote modal */ }} className="control-btn vote-btn secondary">
            Open Vote
          </button>
        </div>
      </div>


      {/* Round Control */}
      <div className={controls.roundControl.className}>
        <h3>Round Control</h3>
        <div className="round-display">Round {gamestate.round}</div>
        <button onClick={() => { sendRequest(ws, GMMessageTypes.NextRound, null) }} className="control-btn primary">Next Round</button>
      </div>

      {/* Day/Night Control */}
      <div className={controls.timeControl.className}>
        <h4>
          Time Phase
          <p className={`status-indicator ${gamestate.night ? 'status-night' : 'status-day'}`}>
            {night}
          </p>
        </h4>
        <button onClick={() => { sendRequest(ws, GMMessageTypes.ShiftTime, null) }} className="control-btn">
          {controls.timeControl.text}
        </button>
      </div>

      {/* Players Status */}
      <div className={controls.endControl.className}>
        <h4>Players Status</h4>
        <div className="players-alive">
          <span className="alive-count">{gamestate.numPlayersAlive}</span>
          <span>players alive</span>
        </div>
        <button onClick={() => { sendRequest(ws, GMMessageTypes.End, null) }} className="control-btn danger">End Game</button>
      </div>
    </div>
  </div>
  )
}

function getControlState(state: GameState) {
  // TODO: add class names for each
  return {
    startControl: {
      disabled: false,
      startButton: {
        text: state.started ? "Pause Game" : "Start Game",
        className: "control-group"
      }
    },
    roundControl: {
      disabled: state.started && state.night,
      className: (state.started && state.night) ? "control-group" : "control-group disabled"
    },
    voteControl: {
      disabled: !state.started,
      className: state.started ? "control-group" : "control-group disabled"
    },
    timeControl: {
      disabled: !state.started,
      text: `Switch to ${state.night ? "Day" : "Night"}`,
      className: state.started ? "control-group" : "control-group disabled"
    },
    endControl: {
      disabled: !state.started,
      className: state.started ? "control-group" : "control-group disabled"

    }
  }
}
