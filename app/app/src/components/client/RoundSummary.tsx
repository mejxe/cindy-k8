import { useContext } from "react"
import type { Summary } from "../../types/types"
import ClientPlayer from "./ClientPlayer"
import { AppContext } from "../../store/gamestate-context"
import "./RoundSummary.css"
// TODO: ADD CSS

export default function RoundSummary({ summary, time }: { summary: Summary, time: number }) {
  const state = useContext(AppContext)
  if (!summary.summaryOn) return
  const player = summary.playerKilled
  const night = state.gameState.night

  const getTimeOfDayText = (night: boolean): string => {
    return state.gameState.night ? "Day" : "Night"

  }
  const render = () => {
    if (player === null) {
      return (
        <div className="roundSummary">
          <h1>{getTimeOfDayText(night)} ended.</h1>
          <div className="playerKilled">
            <h2>No one leaves!</h2>
          </div>
          <h3>{getTimeOfDayText(!night)} will start in {time} seconds.</h3>
        </div>
      )
    }
    else if (player.id !== state.me.id) {
      return (
        <div className="roundSummary">
          <h1>{getTimeOfDayText(night)} ended.</h1>
          <div className="playerKilled">
            <h2>You leave the city.</h2>
          </div>
          <h3>{getTimeOfDayText(!night)} will start in {time} seconds.</h3>
        </div>
      )
    } else {
      const playerName = `${player.firstName} ${player.lastName}`
      const playerLeftMessage = state.gameState.night ? `${playerName} has left the city.` : `${playerName} was killed.`
      return (
        <div className="roundSummary">
          <h1>{getTimeOfDayText(night)} ended.</h1>
          <div className="playerKilled">
            <h2>{playerLeftMessage}</h2>
            {ClientPlayer(player, state.me, null)}
          </div>
          <h3>{getTimeOfDayText(!night)} will start in {time} seconds.</h3>
        </div>
      )
    }
  }
  return render()

}
