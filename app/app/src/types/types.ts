
export const States = {
  Loading: "loading",
  CharacterCreation: "characterCreation",
  Lobby: "lobby",
  Game: "game",
  Results: "results",
} as const

export const defaultState: GameState = {
  players: [],
  round: 0,
  numPlayersAlive: 0,
  night: false,
  started: false,
  holdingMic: null,
  voting: false,
}
export const defaultGameInfo: GameInfo = {
  gameState: defaultState,
  me: null
}

export type Player = {
  id: number,
  firstName: string,
  lastName: string,
  occupation: string,
  alive: boolean
  syndicate: boolean
  connected: boolean
}
export type GameState = {
  started: boolean,
  players: Player[],
  round: number,
  numPlayersAlive: number,
  night: boolean,
  voting: boolean
  holdingMic: Player | null,
}
export type GameInfo = {
  gameState: GameState,
  me: Player | null
}
export type StateKeys = typeof States[keyof typeof States]
