import { GameStatus, PlayerStatus, Entity, CanvasCalcs, FullState } from './types'
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
    type: EntityType.Player,
    state: PlayerState.Idle,
    xpos: 0,
    ypos: 114,
    speed: 4,
    frameIndex: 0,
    bboxStartXOffset: 0,
    bboxStartYOffset: 0,
    bboxWidth: 0,
    bboxHeight: 0
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

const updateStatus = (
    ctx: CanvasRenderingContext2D, 
    prevGame: GameStatus, 
    prevPlayer: PlayerStatus): FullState => {
    // Update canvas values
    startX = Math.floor(-ctx.canvas.width * .5)
    topY = Math.floor(-ctx.canvas.height * .5)
    maxX = ctx.canvas.width
    maxY = ctx.canvas.height

    // Reposition the player if they are out of bounds due to resizing
    if (prevPlayer.xpos + 5 < startX) {
        prevPlayer = {...prevPlayer, xpos: startX + 1}
    } else if ((prevPlayer.xpos * 2) - 5 > maxX) {
        prevPlayer = {...prevPlayer, xpos: Math.floor((maxX * .5) - 1)}
    }

    // Pause the game if we unfocus it
    if (document.activeElement !== ctx.canvas) {
        prevGame = {...prevGame, state: GameState.Paused}
    }

    // Gradually increase the fall speed of entities
    let spawnWait = prevGame.spawnWait
    let fallSpeedMultiplier = prevGame.fallSpeedMultiplier
    if (prevGame.state === GameState.Playing) {
        if (spawnWait > 60) {
            spawnWait -= .1
        }
        if (fallSpeedMultiplier < 10) {
            fallSpeedMultiplier += .0005
        }
    }

    // Handle player states
    switch(prevPlayer.state) {
        case PlayerState.Idle:
            prevPlayer = PlayerScripts.idle(prevGame, prevPlayer)
            break
        case PlayerState.Running:
            prevPlayer = PlayerScripts.running(prevGame, prevPlayer, startX, maxX)
            break
    }

    // Make entities fall/clear them when out of canvas
    const entityArr: Entity[] = []
    prevGame.entities.forEach(entity => {
        if (entity.ypos >= ctx.canvas.height - prevGame.spriteSize ||
            entity.cycled) {
            return
        }
        entityArr.push({
            ...entity,
            ypos: entity.ypos + (entity.speed * prevGame.fallSpeedMultiplier)
        })
    })

    prevGame = {
        ...prevGame, 
        entities: entityArr, 
        spawnWait,
        fallSpeedMultiplier,
        spawnTickCount: prevGame.spawnTickCount + 1,
        tickCount: prevGame.tickCount + 1
    }

    return {game: prevGame, player: prevPlayer}
}

const draw = (
    ctx: CanvasRenderingContext2D, 
    gameTextElement: HTMLElement,
    prevGame: GameStatus,
    prevPlayer: PlayerStatus): FullState => {
    // Clear the canvas
    ctx.fillStyle = '#161922'
    ctx.fillRect(startX, topY, maxX, maxY)

    const drawEntity = (entity: PlayerStatus | Entity, imageIndex: number) => {
        const defaults = {
            image: spritesheet as HTMLImageElement,
            sWidth: prevGame.spriteSize,
            sHeight: prevGame.spriteSize,
            dx: Math.floor(entity.xpos - (prevGame.spriteSize * .5)),
            dy: Math.floor(entity.ypos - (prevGame.spriteSize * .5)),
            dWidth: prevGame.spriteSize,
            dHeight: prevGame.spriteSize
        }

        let sx = entity.frameIndex * prevGame.spriteSize
        let sy = imageIndex * prevGame.spriteSize

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

    // Draw foreground
    for (let i = 0; i < canvasCalcs.foregroundXpos.length; i++) {
        ctx.drawImage(foreground, canvasCalcs.foregroundXpos[i], 128)
    }

    // Draw entities
    prevGame.entities.forEach(entity => {
        drawEntity(entity, entity.type)

        // JUST FOR TESTING WHERE COLLISION IS...
        /*
        ctx.globalAlpha = .5
        ctx.fillStyle = 'red'
        ctx.fillRect(
            (entity.xpos - (game.spriteSize * .5)) + entity.bboxStartXOffset, 
            (entity.ypos - (game.spriteSize * .5)) + entity.bboxStartYOffset, 
            entity.bboxWidth,
            entity.bboxHeight
        )
        ctx.globalAlpha = 1
        */
    })

    // Draw player
    switch(prevPlayer.state) {
        case PlayerState.Idle:
            drawEntity(prevPlayer, ImageIndex.PlayerIdle)
            break
        case PlayerState.Running:
            if (!(prevGame.input.left && prevGame.input.right)) {
                if (prevGame.input.left) {
                    drawEntity(prevPlayer, ImageIndex.PlayerRunLeft)
                } else if (prevGame.input.right) {
                    drawEntity(prevPlayer, ImageIndex.PlayerRunRight)
                }
            } else {
                drawEntity(prevPlayer, ImageIndex.PlayerIdle)
            }
            break
    }

    // Draw score
    ctx.fillStyle = 'white'
    ctx.font = '24px VT323'
    ctx.fillText(
        `SCORE: ${prevGame.score}`, 
        startX + 12, 
        topY + 24
    )

    // Draw other game states
    if (prevGame.state === GameState.Paused || prevGame.state === GameState.GameOver) {
        ctx.fillStyle = '#161922'
        ctx.fillRect(startX, topY, maxX, maxY)
        if (prevGame.state === GameState.Paused) {
            gameTextElement.style.top = '140px'
            gameTextElement.innerText = 'Paused'
        } else if (prevGame.state === GameState.GameOver) {
            gameTextElement.style.top = '120px'
            gameTextElement.innerHTML = `Game Over <br> SCORE: ${prevGame.score}`

            // Reset game/player data
            prevGame = initialGameStatus
            prevPlayer = initialPlayerStatus
        }
    }

    // JUST FOR TESTING WHERE PLAYER COLLISION IS...
    /*
    ctx.globalAlpha = .5
    ctx.fillStyle = 'red'
    ctx.fillRect(
        (player.xpos - (game.spriteSize * .5)) + 12, 
        (player.ypos - (game.spriteSize * .5)) + 2, 
        game.spriteSize - 25,
        game.spriteSize - 2
    )
    ctx.globalAlpha = 1
    */

    // Update current frame
    if (prevGame.tickCount === prevGame.tickRate) {
        // Update player frames
        if (!(prevPlayer.state === PlayerState.Idle && prevGame.tickSkip)) {
            prevPlayer = {
                ...prevPlayer, 
                frameIndex: (
                    prevPlayer.frameIndex === prevGame.spriteFrameCount - 1 ? 0
                    : prevPlayer.frameIndex + 1
                )
            }
        }
        
        // Update non-player entity frames
        const entityArr: Entity[] = []
        prevGame.entities.forEach(entity => {
            if (entity.type !== EntityType.StarCaught) {
                if (!prevGame.tickSkip) {
                    entityArr.push({
                        ...entity,
                        frameIndex: (
                            entity.frameIndex === prevGame.spriteFrameCount - 1 ? 0
                            : entity.frameIndex + 1
                        )
                    })
                } else {
                    entityArr.push(entity)
                }
            } else {
                if (entity.frameIndex === prevGame.spriteFrameCount - 1) {
                    entityArr.push({
                        ...entity,
                        frameIndex: 0,
                        cycled: true
                    })
                } else {
                    entityArr.push({
                        ...entity,
                        frameIndex: (
                            entity.frameIndex === prevGame.spriteFrameCount - 1 ? 0
                            : entity.frameIndex + 1
                        )
                    })
                }
            }
        })

        prevGame = {
            ...prevGame, 
            entities: entityArr, 
            tickSkip: !prevGame.tickSkip, 
            tickCount: 0
        }
    }

    return {game: prevGame, player: prevPlayer}
}

const handleSpawning = (prevGame: GameStatus): GameStatus => {
    if (prevGame.state === GameState.Playing) {
        if (prevGame.spawnTickCount >= prevGame.spawnWait) {
            const badEntityTypes = [EntityType.Meteor, EntityType.Meteor2, EntityType.UFO]
            const newEntities: Entity[] = []
            let starsSpawned = 0
            let maxStars = canvasCalcs.maxStars || 0
            if (maxStars < 1) maxStars = 1

            // Spawn bad entities
            for (let i = 0; i < canvasCalcs.entityXpos.length; i++) {
                const type = badEntityTypes[Math.floor(Math.random() * badEntityTypes.length)]
                let bbox: number[] = []

                // Set bboxes
                switch (type) {
                    case EntityType.Meteor:
                        bbox = [ 12, 12, prevGame.spriteSize - 24, prevGame.spriteSize - 24 ]
                        break
                    case EntityType.Meteor2:
                        bbox = [ 22, 22, prevGame.spriteSize - 42, prevGame.spriteSize - 42 ]
                        break
                    case EntityType.UFO:
                        bbox = [ 12, 16, prevGame.spriteSize - 20, prevGame.spriteSize - 28 ]
                        break
                }

                if (Math.random() > .5) {
                    newEntities.push({
                        type,
                        xpos: canvasCalcs.entityXpos[i],
                        ypos: (canvasCalcs.entityYpos || 0),
                        frameIndex: 0,
                        speed: 1 + (Math.random()),
                        bboxStartXOffset: bbox[0],
                        bboxStartYOffset: bbox[1],
                        bboxWidth: bbox[2],
                        bboxHeight: bbox[3]
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
                        speed: .5 + (Math.random()),
                        bboxStartXOffset: 16,
                        bboxStartYOffset: 14,
                        bboxWidth: prevGame.spriteSize - 32,
                        bboxHeight: prevGame.spriteSize - 28
                    }
                    starsSpawned++
                }
            }

            prevGame = {
                ...prevGame, 
                entities: [...prevGame.entities, ...newEntities],
                spawnTickCount: 0
            }
        }
    }

    return prevGame
}

const handleCollision = (prevGame: GameStatus, prevPlayer: PlayerStatus): FullState => {
    // Initialize player bbox width/height
    if (prevPlayer.bboxWidth === 0) {
        prevPlayer = {
            ...prevPlayer,
            bboxStartXOffset: 12,
            bboxStartYOffset: 2,
            bboxWidth: prevGame.spriteSize - 25,
            bboxHeight: prevGame.spriteSize - 2
        }
    }

    // Collision detection is wrapped with this condition because
    // we don't need to check it that often
    if (!prevGame.tickCount && prevGame.tickSkip) {
        const pStartX = (prevPlayer.xpos - (prevGame.spriteSize * .5)) 
            + prevPlayer.bboxStartXOffset
        const pTopY = (prevPlayer.ypos - (prevGame.spriteSize * .5))
            + prevPlayer.bboxStartYOffset

        const entityArr: Entity[] = []
        let caughtStar = false
        prevGame.entities.forEach(entity => {
            const eStartX = (entity.xpos - (prevGame.spriteSize * .5)) 
                + entity.bboxStartXOffset
            const eTopY = (entity.ypos - (prevGame.spriteSize * .5))
                + entity.bboxStartYOffset

            if (pStartX < eStartX + entity.bboxWidth &&
                pStartX + prevPlayer.bboxWidth > eStartX &&
                pTopY < eTopY + entity.bboxHeight &&
                pTopY + prevPlayer.bboxHeight > eTopY) {
                    if (entity.type === EntityType.Star) {
                        entityArr.push({
                            ...entity,
                            type: EntityType.StarCaught,
                            frameIndex: 0,
                            cycled: false
                        })
                        caughtStar = true
                        // Add point to score
                        prevGame = {...prevGame, score: prevGame.score + 1}
                        return
                    } else if (entity.type !== EntityType.StarCaught) {
                        // Game over :(
                        prevGame = {...prevGame, state: GameState.GameOver}
                        return
                    }
                }
                entityArr.push(entity)
        })

        // We only need to update this if a star was caught
        if (caughtStar) {
            prevGame = {...prevGame, entities: entityArr}
        }
    }

    return {game: prevGame, player: prevPlayer}
}

const gameLoop = (
    ctx: CanvasRenderingContext2D,
    gameTextElement: HTMLElement,
    state?: GameState): void => {
    if (state) {
        ctx.canvas.style.cursor = 'default'
        game = {...game, state}
    }
    game = handleSpawning(game)
    {({game, player} = handleCollision(game, player))}
    {({game, player} = updateStatus(ctx, game, player))}
    {({game, player} = draw(ctx, gameTextElement, game, player))}

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
        gameTextElement.innerText = 'Game Start'

        const startGame = (): void => {
            window.requestAnimationFrame(() => (
                gameLoop(ctx, gameTextElement, GameState.Playing)
            ))
            gameTextElement.innerText = ''
        }

        canvas.addEventListener('click', () => {
            if (game.state !== GameState.Playing) {
                startGame()
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
        canvas.addEventListener('keydown', event => {
            if (event.key !== 'Tab') {
                event.preventDefault()
            }
            if (game.state === GameState.Playing) {
                if (event.key === 'ArrowLeft' || event.key === 'a') {
                    game = {...game, input: { left: true, right: game.input.right }}
                }
                if (event.key === 'ArrowRight' || event.key === 'd') {
                    game = {...game, input: { left: game.input.left, right: true }}
                }
            } else if (event.key === 'Enter' || event.key === 'Spacebar' || event.key === ' ') {
                startGame()
            }
        })
        canvas.addEventListener('keyup', event => {
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
                    const entitiesPerSpawn = Math.ceil(ctx.canvas.width / (game.spriteSize * 2))
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
