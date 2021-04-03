import { GameState, PlayerState, EntityType } from './enums'

interface Entity {
    type: EntityType
    xpos: number
    ypos: number
    frameIndex: number
    speed: number // Base speed
    bboxStartXOffset: number
    bboxStartYOffset: number
    bboxWidth: number
    bboxHeight: number
    cycled?: boolean // Check if the animation has finished
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
    spriteFrameCount: number,
    spawnWait: number,
    spawnTickCount: number,
    fallSpeedMultiplier: number
}

interface PlayerStatus extends Entity {
    state: PlayerState
}

interface CanvasCalcs {
    maxStars: number | null
    entityXpos: number[]
    entityYpos: number | null
    foregroundXpos: number[]
}

export type { GameStatus, PlayerStatus, Entity, CanvasCalcs }
