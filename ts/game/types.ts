import { GameState, PlayerState, Entity } from './enums'

interface GameStatus {
    state: GameState
    entities: {
        type: Entity,
        xpos: number,
        ypos: number
    }[]
    score: number,
    input: {
        left: boolean,
        right: boolean
    }
}

interface PlayerStatus {
    state: PlayerState
    xpos: number
    ypos: number
    speed: number
}

export type { GameStatus, PlayerStatus }
