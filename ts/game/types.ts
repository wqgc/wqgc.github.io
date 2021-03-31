import { GameState, PlayerState, EntityType } from './enums'

interface Entity {
    type: EntityType
    xpos: number
    ypos: number
    frameIndex: number
}

interface GameStatus {
    state: GameState
    entities: Entity[]
    score: number,
    input: {
        left: boolean,
        right: boolean
    },
    tickRate: number,
    tickSkip: boolean,
    tickCount: number,
    spriteSize: number,
    spriteFrameCount: number
}

interface PlayerStatus {
    state: PlayerState
    xpos: number
    ypos: number
    speed: number
    frameIndex: number
}

export type { GameStatus, PlayerStatus, Entity }
