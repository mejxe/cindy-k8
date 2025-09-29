import { useContext } from "react"
import { AppContext } from "../../store/gamestate-context"
import ClientPlayer from "./ClientPlayer"
import type { GameSummary } from "../../types/types"
import "./css/GameSummary.css"

export default function GameSummary({ gameSummaryHandle }:
  {
    gameSummaryHandle: GameSummary
  }) {
  const state = useContext(AppContext)
  if (!gameSummaryHandle.gameSummaryOn) return
  const result = gameSummaryHandle.syndicateWins ? "Syndicate wins!" : "City wins!"
  return <div className="gameSummary">
    <div className="gameSummaryCard">
      <h1>Game Summary</h1>
      <h2>{result}</h2>
      <h2>Syndicate members</h2>
      <ul className="syndicateMembers">
        {gameSummaryHandle.syndicates.map(p => {
          return ClientPlayer(p, state.me, null)
        })}
      </ul>
      <button onClick={() => {
        gameSummaryHandle.setGameSummaryOn(false)
        console.log("clicked")
      }}>Close summary</button>
    </div>
  </div>

}
