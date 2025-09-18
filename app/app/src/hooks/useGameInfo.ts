import { useState } from "react"
import { defaultState, defaultVote, type GameInfo, type GameState, type Player, type Vote } from "../types/types"

export function useGameInfo() {
    const [gameState, setGameState] = useState<GameState>(defaultState)
    const [me, setMe] = useState<Player | null>(null)
    const [vote, setVote] = useState<Vote>(defaultVote)
    const gameInfo: GameInfo = { gameState, me, vote }
    return {
        gameInfo,
        setters: {
            setGameState,
            setMe,
            setVote,
        }
    }
}
