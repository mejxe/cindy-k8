
export const States = {
  Loading: "loading",
  CharacterCreation: "characterCreation",
  Lobby: "lobby",
  Game: "game",
  Results: "results",
} as const

export const defaultState: AppStateType = {
  players: [],
  round: 0,
  numPlayersAlive: 0,
  night: false,
  started: false,
  holdingMic: null
}
export type Player = {
  id: number,
  firstName: string,
  lastName: string,
  occupation: string,
  alive: boolean
  syndicate: boolean
}
export type AppStateType = {
  players: Player[],
  round: number,
  numPlayersAlive: number,
  night: boolean,
  started: boolean,
  holdingMic: Player | null,
}
export type StateKeys = typeof States[keyof typeof States]
