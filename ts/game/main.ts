import { GameStatus, PlayerStatus, Entity, CanvasCalcs } from './types'
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
const foreground = new Image()
foreground.src = 'images/gameforeground.png'

let startX: number, topY: number, maxX: number, maxY: number

// So we only have to do these calculations when resizing
let canvasCalcs: CanvasCalcs = {
    maxStars: null,
    entityXpos: [],
    entityYpos: null,
    foregroundXpos: []
}

const updateStatus = (ctx: CanvasRenderingContext2D, gameTextElement: HTMLElement): void => {
    // Update canvas values
    startX = Math.floor(-ctx.canvas.width * .5)
    topY = Math.floor(-ctx.canvas.height * .5)
    maxX = ctx.canvas.width
    maxY = ctx.canvas.height

    // Reposition the player if they are out of bounds due to resizing
    if (player.xpos + 5 < startX) {
        player = {...player, xpos: startX + 1}
    } else if ((player.xpos * 2) - 5 > maxX) {
        player = {...player, xpos: Math.floor((maxX * .5) - 1)}
    }

    // Pause the game if we unfocus it
    if (document.activeElement !== ctx.canvas) {
        game = {...game, state: GameState.Paused}
        gameTextElement.innerText = 'Paused'
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
            player = PlayerScripts.idle(game, player)
            break
        case PlayerState.Running:
            player = PlayerScripts.running(game, player, startX, maxX)
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
        spawnTickCount: game.spawnTickCount + 1,
        tickCount: game.tickCount + 1
    }
}

const draw = (ctx: CanvasRenderingContext2D): void => {
    // Clear the canvas
    ctx.fillStyle = '#161922'
    ctx.fillRect(startX, topY, maxX, maxY)

    const drawEntity = (entity: PlayerStatus | Entity, imageIndex: number) => {
        const defaults = {
            image: spritesheet as HTMLImageElement,
            sWidth: game.spriteSize,
            sHeight: game.spriteSize,
            dx: Math.floor(entity.xpos - (game.spriteSize * .5)),
            dy: Math.floor(entity.ypos - (game.spriteSize * .5)),
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

    // Draw foreground
    for (let i = 0; i < canvasCalcs.foregroundXpos.length; i++) {
        ctx.drawImage(foreground, canvasCalcs.foregroundXpos[i], 128)
    }

    // Draw entities
    game.entities.forEach(entity => {
        switch(entity.type) {
            case EntityType.Star:
                drawEntity(entity, ImageIndex.Star)
                break
            case EntityType.Meteor:
                drawEntity(entity, ImageIndex.Meteor)
                break
            case EntityType.Meteor2:
                drawEntity(entity, ImageIndex.Meteor2)
                break
            case EntityType.UFO:
                drawEntity(entity, ImageIndex.UFO)
                break
        }
    })

    // Draw player
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

    if (game.state === GameState.Paused) {
        ctx.fillStyle = '#161922'
        ctx.fillRect(startX, topY, maxX, maxY)
    }
}

const handleSpawning = (): void => {
    if (game.state === GameState.Playing) {
        if (game.spawnTickCount >= game.spawnWait) {
            const badEntityTypes = [EntityType.Meteor, EntityType.Meteor2, EntityType.UFO]
            const newEntities = []
            let starsSpawned = 0
            let maxStars = canvasCalcs.maxStars || 0
            if (maxStars < 1) maxStars = 1

            // Spawn bad entities
            for (let i = 0; i < canvasCalcs.entityXpos.length; i++) {
                if (Math.random() > .5) {
                    newEntities.push({
                        type: badEntityTypes[Math.floor(Math.random() * badEntityTypes.length)],
                        xpos: canvasCalcs.entityXpos[i],
                        ypos: (canvasCalcs.entityYpos || 0),
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

const gameLoop = (
    ctx: CanvasRenderingContext2D,
    gameTextElement: HTMLElement,
    state?: GameState): void => {
    if (state) {
        ctx.canvas.style.cursor = 'default'
        game = {...game, state}
    }
    handleSpawning()
    updateStatus(ctx, gameTextElement)
    draw(ctx)

    if (game.state === GameState.Playing) {
        window.requestAnimationFrame(() => gameLoop(ctx, gameTextElement))
    }
}

const runGame = (canvas: HTMLCanvasElement | null): void | null => {
    // Stop if we didn't get a canvas, or if it isn't supported
    if (!canvas || !canvas.getContext) return null

    const gameTextElement = document.getElementById('game-text')
    const ctx = canvas.getContext('2d')
    if (ctx !== null && gameTextElement) {
        canvas.addEventListener('click', () => {
            if (game.state !== GameState.Playing) {
                window.requestAnimationFrame(() => (
                    gameLoop(ctx, gameTextElement, GameState.Playing)
                ))
                gameTextElement.innerText = ''
            }
        })

        // Game text hover effect
        canvas.addEventListener('mouseenter', () => {
            if (game.state !== GameState.Playing) {
                gameTextElement.classList.add('text-grow')
                gameTextElement.style.color = '#CBD3FF'
                canvas.style.cursor = 'pointer'

                if (gameTextElement.innerText === 'Paused') {
                    gameTextElement.innerText = 'Unpause'
                }
            }
        })
        canvas.addEventListener('mouseout', () => {
            if (game.state !== GameState.Playing) {
                gameTextElement.classList.remove('text-grow')
                gameTextElement.style.color = 'white'

                if (gameTextElement.innerText === 'Unpause') {
                    gameTextElement.innerText = 'Paused'
                }
            }
        })

        // INPUT
        // Get keyboard input
        document.addEventListener('keydown', event => {
            if (game.state === GameState.Playing) {
                if (event.key === 'ArrowLeft' || event.key === 'a') {
                    game = {...game, input: { left: true, right: game.input.right }}
                }
                if (event.key === 'ArrowRight' || event.key === 'd') {
                    game = {...game, input: { left: game.input.left, right: true }}
                }
            }
        })
        document.addEventListener('keyup', event => {
            if (game.state === GameState.Playing) {
                if (event.key === 'ArrowLeft' || event.key === 'a') {
                    game = {...game, input: { left: false, right: game.input.right }}
                }
                if (event.key === 'ArrowRight' || event.key === 'd') {
                    game = {...game, input: { left: game.input.left, right: false }}
                }
            }
        })

        // Handle mobile touch input
        canvas.addEventListener('touchstart', event => {
            if (game.state === GameState.Playing && event.cancelable) {
                event.preventDefault()
                if ((event.targetTouches[0] ? event.targetTouches[0].pageX 
                    : event.changedTouches[event.changedTouches.length-1].pageX) 
                    < player.xpos + (window.innerWidth * .5)) {
                    game = {...game, input: { left: true, right: false }}
                } else {
                    game = {...game, input: { left: false, right: true }}
                }
            }
        })
        canvas.addEventListener('touchend', () => {
            if (game.state === GameState.Playing) {
                game = {...game, input: { left: false, right: false }}
            }
        })
        //

        let resizeTimer: NodeJS.Timeout | null = null
        const resizeCanvas = (): void => {
            let width = document.getElementById('projects')?.clientWidth
            if (width) {
                ctx.canvas.height = 320
                ctx.canvas.width = width
                ctx.translate(Math.floor(width * .5), Math.floor(ctx.canvas.height * .5))

                // Use a timer to limit calculations on resize
                if (resizeTimer) {
                    clearTimeout(resizeTimer)
                }

                resizeTimer = setTimeout(() => {
                    // Set some spawning calculations based on canvas width
                    const entitiesPerSpawn = Math.floor(ctx.canvas.width / (game.spriteSize * 2))
                    const entityXpos = []
                    const foregroundXpos = []

                    for (let i = 0; i < entitiesPerSpawn; i++) {
                        entityXpos.push(
                            (Math.floor(-ctx.canvas.width * .5) 
                            + (i * (game.spriteSize * 2))) 
                            + (game.spriteSize * .5)
                        )
                    }

                    for (let i = 0; i < Math.ceil(ctx.canvas.width / game.spriteSize); i++) {
                        foregroundXpos.push(
                            (Math.floor(-ctx.canvas.width * .5) 
                            + (i * game.spriteSize))
                        )
                    }

                    canvasCalcs = {
                        maxStars: Math.floor(ctx.canvas.width / (game.spriteSize * 5)),
                        entityXpos,
                        entityYpos: (0 - (ctx.canvas.height * .5)) - game.spriteSize,
                        foregroundXpos
                    }
                }, 100)
            }
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)
    }
    
}

export default runGame 
