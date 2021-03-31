import { GameStatus, PlayerStatus, Entity } from './types'
import { GameState, PlayerState, ImageIndex } from './enums'
import * as PlayerScripts from './states/PlayerScripts'

// Initialize data
const initialGameStatus: GameStatus = {
    state: GameState.Playing,
    entities: [],
    score: 0,
    input: {
        left: false,
        right: false
    },
    tickRate: 6,
    tickSkip: false, // Used for slower animations
    tickCount: 0,
    spriteSize: 64,
    spriteFrameCount: 3
}

const initialPlayerStatus: PlayerStatus = {
    state: PlayerState.Idle,
    xpos: 0,
    ypos: 64,
    speed: 4,
    frameIndex: 0
}

let game = initialGameStatus
let player = initialPlayerStatus

const spritesheet = new Image()
spritesheet.src = 'images/gamespritesheet.png'

// Get input
document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        game = {...game, input: { left: true, right: game.input.right }}
    }
    if (event.key === 'ArrowRight') {
        game = {...game, input: { left: game.input.left, right: true }}
    }
})

document.addEventListener('keyup', event => {
    if (event.key === 'ArrowLeft') {
        game = {...game, input: { left: false, right: game.input.right }}
    }
    if (event.key === 'ArrowRight') {
        game = {...game, input: { left: game.input.left, right: false }}
    }
})

const updateStatus = (): void => {
    switch(player.state) {
        case PlayerState.Idle:
            player = PlayerScripts.idle(game, player)
            break
        case PlayerState.Running:
            player = PlayerScripts.running(game, player)
            break
    }
}

const draw = (ctx: CanvasRenderingContext2D): void => {
    // Clear the canvas
    ctx.clearRect(
        -ctx.canvas.width, 
        -ctx.canvas.height, 
        ctx.canvas.width * 2, 
        ctx.canvas.height * 2
    )

    switch(game.state) {
        case GameState.StartScreen:
            return
        case GameState.Playing:
            break
        case GameState.Paused:
            break
        case GameState.GameOver:
            return
    }

    const drawEntity = (entity: PlayerStatus | Entity, imageIndex: number) => {
        const defaults = {
            image: spritesheet as HTMLImageElement,
            sWidth: game.spriteSize,
            sHeight: game.spriteSize,
            dx: entity.xpos - (game.spriteSize * .5),
            dy: entity.ypos - (game.spriteSize * .5),
            dWidth: game.spriteSize,
            dHeight: game.spriteSize
        }

        let sx = entity.frameIndex * game.spriteSize
        let sy = imageIndex * game.spriteSize

        ctx.drawImage(
            defaults.image,
            sx,
            sy,
            defaults.sWidth,
            defaults.sHeight,
            defaults.dx,
            defaults.dy,
            defaults.dWidth,
            defaults.dHeight
        )
    }

    // Update current frame
    if (game.tickCount === game.tickRate) {
        if (!(player.state === PlayerState.Idle && game.tickSkip)) {
            player = {
                ...player, 
                frameIndex: (
                    player.frameIndex === game.spriteFrameCount - 1 ? 0
                    : player.frameIndex + 1
                )
            }
        }
        
        // TO DO: iterate through entities and update them

        game = {...game, tickSkip: !game.tickSkip, tickCount: 0}
    }

    switch(player.state) {
        case PlayerState.Hidden:
            return
        case PlayerState.Idle:
            drawEntity(player, ImageIndex.PlayerIdle)
            break
        case PlayerState.Running:
            if (!(game.input.left && game.input.right)) {
                if (game.input.left) {
                    drawEntity(player, ImageIndex.PlayerRunLeft)
                } else if (game.input.right) {
                    drawEntity(player, ImageIndex.PlayerRunRight)
                }
            } else {
                drawEntity(player, ImageIndex.PlayerIdle)
            }
            break
    }
}

const gameLoop = (ctx: CanvasRenderingContext2D): void => {
    updateStatus()
    draw(ctx)

    game = {...game, tickCount: game.tickCount + 1}

    window.requestAnimationFrame(() => gameLoop(ctx))
}

export default gameLoop
