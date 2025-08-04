import type { WSMessage } from "../../types/messageTypes";
import type { AppStateType } from "../../types/types";
import "./GameState.css"

export default function GameState({ gamestate, ws }: { gamestate: AppStateType, ws: WebSocket }) {
  const night = gamestate.night ? "Nighttime" : "Daytime"
  const started = gamestate.started ? "started" : "Not started"
  const groupClassName = gamestate.started ? "control-group" : "control-group disabled"
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
        <button onClick={() => { sendStartRequest(ws) }} className={`control-btn ${!gamestate.started ? 'primary' : ''}`}>
          {gamestate.started ? "Stop Game" : "Start Game"}
        </button>
      </div>

      {/* Round Control */}
      <div className={groupClassName}>
        <h3>Round Control</h3>
        <div className="round-display">Round {gamestate.round}</div>
        <button className="control-btn primary">Next Round</button>
      </div>

      {/* Day/Night Control */}
      <div className={groupClassName}>
        <h4>
          Time Phase
          <p className={`status-indicator ${gamestate.night ? 'status-night' : 'status-day'}`}>
            {night}
          </p>
        </h4>
        <button className="control-btn">
          Switch to {gamestate.night ? "Day" : "Night"}
        </button>
      </div>

      {/* Players Status */}
      <div className={groupClassName}>
        <h4>Players Status</h4>
        <div className="players-alive">
          <span className="alive-count">{gamestate.numPlayersAlive}</span>
          <span>players alive</span>
        </div>
        <button className="control-btn danger">End Game</button>
      </div>
    </div>
  </div>
  )
}

function sendStartRequest(ws: WebSocket) {
  const message: WSMessage = { type: "start", body: null }
  ws.send(JSON.stringify(message))
  // Send request
  // wait for it to update
}
