import { createContext } from "react";
import { defaultState, type GameState } from "../types/types";

export const AppContext = createContext<GameState>(defaultState)
