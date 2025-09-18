import { useRef, useState } from "react"
import { States, type StateKeys } from "../types/types"

export function useSetup() {
    const [appState, setAppState] = useState<StateKeys>(States.Lobby)
    const websocket = useRef<WebSocket | null>(null)
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
    const [timer, setTimer] = useState<number>(0)
    return {
        data: {
            appState,
            token,
            websocket,
            timer

        },
        setters: {
            setAppState,
            setToken,
            setTimer
        }
    }
}
