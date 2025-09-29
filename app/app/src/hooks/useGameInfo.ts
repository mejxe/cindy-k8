import { useState, type Dispatch, type SetStateAction } from "react"
import { defaultState, defaultVote, type GameInfo, type GameState, type Player, type Vote } from "../types/types"

export type GameInfoHandle = {
    gameInfo: GameInfo,
    setters: {
        setGameState: Dispatch<SetStateAction<GameState>>,
        setMe: Dispatch<SetStateAction<Player | null>>
        setVote: Dispatch<SetStateAction<Vote>>,
    }
}
export function useGameInfo() {
    const [gameState, setGameState] = useState<GameState>(defaultState)
    const [me, setMe] = useState<Player | null>(null)
    const [vote, setVote] = useState<Vote>(defaultVote)
    const gameInfo: GameInfo = { gameState, me, vote }
    const gameInfoHandle: GameInfoHandle = {
        gameInfo,
        setters: {
            setGameState,
            setMe,
            setVote,
        }
    }
    return gameInfoHandle
}
