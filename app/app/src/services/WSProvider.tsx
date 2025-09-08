import { type ReactNode, type RefObject, useEffect, useState } from "react"
import type { WSMessage } from "../types/messageTypes.ts";
import { WebSocketContext } from "../store/websocket-context.tsx"

type WebSocketProviderProps = {
  children: ReactNode
  wsRef: RefObject<WebSocket | null>

}
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, wsRef }) => {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (wsRef.current === null) {
      setConnected(false)
      return
    }
    setConnected(true)
  }, [wsRef])

  const sendMessage = (message: WSMessage) => {
    wsRef.current?.send(JSON.stringify(message))
  }
  const value = {
    socket: wsRef.current,
    sendMessage,
    connected,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );

}
