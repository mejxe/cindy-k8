import { createContext } from "react";
import type { WebSocketContextType } from "../types/types";

export const WebSocketContext = createContext<WebSocketContextType | null>(null)
