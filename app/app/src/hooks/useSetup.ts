import { useRef, useState } from "react"
import { defaultSummary, States, type StateKeys, type Summary } from "../types/types"

export function useSetup() {
    const [appState, setAppState] = useState<StateKeys>(States.Lobby)
    const websocket = useRef<WebSocket | null>(null)
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
    const [timer, setTimer] = useState<number>(0)
    const [roleRevealed, setRoleRevealed] = useState(false)
    const [summary, setSummary] = useState<Summary>(defaultSummary)
    return {
        data: {
            appState,
            token,
            websocket,
            timer,
            roleRevealed,
            summary

        },
        setters: {
            setAppState,
            setToken,
            setTimer,
            setRoleRevealed,
            setSummary
        }
    }
}
