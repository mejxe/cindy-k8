import { createContext } from "react";
import { defaultGameInfo, type GameInfo } from "../types/types";

export const AppContext = createContext<GameInfo>(defaultGameInfo)
