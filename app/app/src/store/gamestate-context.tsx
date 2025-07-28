import { createContext } from "react";
import { defaultState, type AppStateType } from "../types/types";

export const AppContext = createContext<AppStateType>(defaultState)
