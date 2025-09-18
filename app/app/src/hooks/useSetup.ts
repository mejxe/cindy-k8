import { useRef, useState } from "react"
import { States, type StateKeys } from "../types/types"

export function useSetup() {
    const [appState, setAppState] = useState<StateKeys>(States.Lobby)
    const websocket = useRef<WebSocket | null>(null)
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
    return {
        data: {
            appState,
            token,
            websocket
        },
        setters: {
            setAppState,
            setToken
        }
    }
}
