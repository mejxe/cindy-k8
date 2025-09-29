import { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react"
import { defaultSummary, States, type GameSummary, type GameSummaryData, type GameSummaryHandle, type Player, type StateKeys, type Summary } from "../types/types"
import type { CountdownTimer } from "./useTimer"
import useTimer from "./useTimer"

export type Setup = {
    data: {
        appState: StateKeys,
        token: string | null,
        websocket: RefObject<WebSocket | null>,
        roleRevealed: boolean,
        summary: Summary,
    },
    setters: {
        setAppState: Dispatch<SetStateAction<StateKeys>>,
        setToken: Dispatch<SetStateAction<string | null>>,
        setRoleRevealed: Dispatch<SetStateAction<boolean>>,
        setSummary: Dispatch<SetStateAction<Summary>>,
        setGameSummaryData: Dispatch<SetStateAction<GameSummaryData>>,
    }
    timer: CountdownTimer,
    gameSummary: GameSummary
}

export function useSetup() {
    const [appState, setAppState] = useState<StateKeys>(States.Lobby)
    const websocket = useRef<WebSocket | null>(null)
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
    const [roleRevealed, setRoleRevealed] = useState(false)
    const [summary, setSummary] = useState<Summary>(defaultSummary)
    const [gameSummaryOn, setGameSummaryOn] = useState<boolean>(false)
    const [gameSummaryData, setGameSummaryData] = useState<GameSummaryData>({ syndicateWins: false, syndicates: [] })

    const timer = useTimer()
    const gameSummary: GameSummary = { ...gameSummaryData, gameSummaryOn, setGameSummaryOn }
    const setup: Setup = {
        data: {
            appState,
            token,
            websocket,
            roleRevealed,
            summary,
        },
        setters: {
            setAppState,
            setToken,
            setRoleRevealed,
            setSummary,
            setGameSummaryData,

        },
        timer,
        gameSummary,

    }
    return setup
}
