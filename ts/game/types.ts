import { GameState, PlayerState, Entity } from './enums'

interface GameStatus {
    state: GameState
    entities: {
        type: Entity,
        xpos: number,
        ypos: number
    }[]
    score: number
}

interface PlayerStatus {
    state: PlayerState
    xpos: number
    ypos: number
}

export type { GameStatus, PlayerStatus }
