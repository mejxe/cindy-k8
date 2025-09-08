import { useContext } from "react"
import { WebSocketContext } from "../store/websocket-context"

export const useWebSocket = () => {
    const context = useContext(WebSocketContext)
    if (!context) {
        throw new Error("Websocket context not initialized.")
    }
    return context
}
