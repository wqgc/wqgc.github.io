import { GameStatus, PlayerStatus, Entity } from './types'
import { GameState, PlayerState, ImageIndex, EntityType } from './enums'
import * as PlayerScripts from './states/PlayerScripts'

// Initialize data
const initialGameStatus: GameStatus = {
    state: GameState.StartScreen,
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
    spriteFrameCount: 3,
    spawnWait: 200,
    spawnTickCount: 0,
    fallSpeedMultiplier: 1
}

const initialPlayerStatus: PlayerStatus = {
    state: PlayerState.Idle,
    xpos: 0,
    ypos: 114,
    speed: 4,
    frameIndex: 0
}

let game: GameStatus = initialGameStatus
let player: PlayerStatus = initialPlayerStatus

const spritesheet = new Image()
spritesheet.src = 'images/gamespritesheet.png'

let topX: number, topY: number, maxX: number, maxY: number

// Get input
document.addEventListener('keydown', event => {
    switch(game.state) {
        case GameState.Playing:
            if (event.key === 'ArrowLeft') {
                game = {...game, input: { left: true, right: game.input.right }}
            }
            if (event.key === 'ArrowRight') {
                game = {...game, input: { left: game.input.left, right: true }}
            }
            break
    }
})

document.addEventListener('keyup', event => {
    switch(game.state) {
        case GameState.Playing:
            if (event.key === 'ArrowLeft') {
                game = {...game, input: { left: false, right: game.input.right }}
            }
            if (event.key === 'ArrowRight') {
                game = {...game, input: { left: game.input.left, right: false }}
            }
            break
    }
})

const updateStatus = (ctx: CanvasRenderingContext2D): void => {
    // Update canvas values
    topX = -ctx.canvas.width * .5
    topY = -ctx.canvas.height * .5
    maxX = ctx.canvas.width
    maxY = ctx.canvas.height

    if (game.state === GameState.Playing) {
        // Pause the game if we unfocus it
        if (document.activeElement !== ctx.canvas) {
            game = {...game, state: GameState.Paused}
        }

        // Gradually increase the fall speed of entities
        let spawnWait = game.spawnWait
        let fallSpeedMultiplier = game.fallSpeedMultiplier
        if (game.state === GameState.Playing) {
            if (spawnWait > 60) {
                spawnWait -= .1
            }
            if (fallSpeedMultiplier < 3) {
                fallSpeedMultiplier += .001
            }
        }

        // Handle player states
        switch(player.state) {
            case PlayerState.Idle:
                player = PlayerScripts.idle(game, player, topX, maxX)
                break
            case PlayerState.Running:
                player = PlayerScripts.running(game, player, topX, maxX)
                break
        }

        // Make entities fall/clear them when out of canvas
        const entityArr: Entity[] = []
        game.entities.forEach(entity => {
            if (entity.ypos >= ctx.canvas.height - game.spriteSize) {
                return
            }
            entityArr.push({
                ...entity,
                ypos: entity.ypos + (entity.speed * game.fallSpeedMultiplier)
            })
        })

        game = {
            ...game, 
            entities: entityArr, 
            spawnWait,
            fallSpeedMultiplier,
            spawnTickCount: game.spawnTickCount + 1
        }
    } else if (GameState.StartScreen || GameState.Paused) {
        // Start/resume game on focus
        if (document.activeElement === ctx.canvas) {
            game = {...game, state: GameState.Playing}
        }
    }
}

const draw = (ctx: CanvasRenderingContext2D): void => {
    // Clear the canvas
    ctx.clearRect(topX, topY, maxX, maxY)

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
        // Update player frames
        if (!(player.state === PlayerState.Idle && game.tickSkip)) {
            player = {
                ...player, 
                frameIndex: (
                    player.frameIndex === game.spriteFrameCount - 1 ? 0
                    : player.frameIndex + 1
                )
            }
        }
        
        // Update non-player entity frames
        const entityArr: Entity[] = []
        game.entities.forEach(entity => {
            if (!game.tickSkip) {
                entityArr.push({
                    ...entity,
                    frameIndex: (
                        entity.frameIndex === game.spriteFrameCount - 1 ? 0
                        : entity.frameIndex + 1
                    )
                })
            } else {
                entityArr.push(entity)
            }
        })

        game = {
            ...game, 
            entities: entityArr, 
            tickSkip: !game.tickSkip, 
            tickCount: 0
        }
    }

    // Draw stuff
    game.entities.forEach(entity => {
        switch(entity.type) {
            case EntityType.Star:
                drawEntity(entity, ImageIndex.Star)
                break
            case EntityType.Bug:
                drawEntity(entity, ImageIndex.PlayerIdle) // TEMP!
                break
            case EntityType.Bug2:
                drawEntity(entity, ImageIndex.PlayerRunLeft) // TEMP!
                break
        }
    })

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

    switch(game.state) {
        case GameState.StartScreen:
            ctx.fillStyle = 'black'
            ctx.rect(topX, topY, maxX, maxY)
            ctx.fill()
            ctx.fillStyle = 'white'
            ctx.font = '48px VT323'
            ctx.fillText('Start', -44, 0)
            ctx.fillText('Game', -38, 34)
            return
        case GameState.Paused:
            ctx.globalAlpha = 0.5
            ctx.fillStyle = 'black'
            ctx.rect(topX, topY, maxX, maxY)
            ctx.fill()
            ctx.globalAlpha = 1
            ctx.fillStyle = 'white'
            ctx.font = '48px VT323'
            ctx.fillText('Paused', -54, 10)
            return
        case GameState.GameOver:
            return
    }
}

const handleSpawning = (ctx: CanvasRenderingContext2D): void => {
    if (game.state === GameState.Playing) {
        if (game.spawnTickCount >= game.spawnWait) {
            const badEntityTypes = [EntityType.Bug, EntityType.Bug2]
            const newEntities = []
            let starsSpawned = 0
            let maxStars = Math.floor(ctx.canvas.width / (game.spriteSize * 5))
            if (maxStars < 1) maxStars = 1

            // Spawn bad entities
            for (let i = 0; i < Math.floor(ctx.canvas.width / game.spriteSize); i++) {
                if (Math.random() > .5) {
                    newEntities.push({
                        type: badEntityTypes[Math.floor(Math.random() * badEntityTypes.length)],
                        xpos: (topX + (i * (game.spriteSize * 1.2))) + (game.spriteSize * .5),
                        ypos: (0 - (ctx.canvas.height * .5)) - game.spriteSize,
                        frameIndex: 0,
                        speed: 1 + (Math.random())
                    })
                }
            }

            // Replace some bad entities with stars
            for (let i = 0; i < newEntities.length; i++) {
                if (starsSpawned === maxStars) {
                    break
                }

                if (Math.random() > .5) {
                    newEntities[i] = {
                        ...newEntities[i], 
                        type: EntityType.Star, 
                        speed: .5 + (Math.random())
                    }
                    starsSpawned++
                }
            }

            game = {
                ...game, 
                entities: [...game.entities, ...newEntities], 
                spawnTickCount: 0
            }
        }
    }
}

const gameLoop = (ctx: CanvasRenderingContext2D): void => {
    handleSpawning(ctx)
    updateStatus(ctx)
    draw(ctx)

    // Triggers animation, even when paused (I think it looks neat)
    game = {...game, tickCount: game.tickCount + 1}

    window.requestAnimationFrame(() => gameLoop(ctx))
}

export default gameLoop
