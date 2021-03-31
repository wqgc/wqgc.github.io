import { GameStatus, PlayerStatus } from './types'
import { GameState, PlayerState } from './enums'

// Initialize data
const initialGameStatus: GameStatus = {
    state: GameState.Playing,
    entities: [],
    score: 0,
    input: {
        left: false,
        right: false
    }
}

const initialPlayerStatus: PlayerStatus = {
    state: PlayerState.Idle,
    xpos: 0,
    ypos: 40,
    speed: 4
}

let game = initialGameStatus
let player = initialPlayerStatus

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

const updatePositions = (): void => {
    if (!(game.input.left && game.input.right)) {
        if (game.input.left) {
            player = {...player, xpos: player.xpos - player.speed}
        } else if (game.input.right) {
            player = {...player, xpos: player.xpos + player.speed}
        }
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

    switch(player.state) {
        case PlayerState.Idle:
            ctx.fillStyle = '#fff'
            ctx.fillRect(player.xpos, player.ypos, 10, 10)
            break
        case PlayerState.Running:
            break
    }
}

const gameLoop = (ctx: CanvasRenderingContext2D): void => {
    updatePositions()
    draw(ctx)
    window.requestAnimationFrame(() => gameLoop(ctx))
}

export default gameLoop
