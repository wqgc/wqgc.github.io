import { GameStatus, PlayerStatus } from '../types'
import { PlayerState } from '../enums'

const idle = ( game: GameStatus, player: PlayerStatus): PlayerStatus => {
    // If one run input is pressed, update state
    if (!(game.input.left && game.input.right) 
        && (game.input.left || game.input.right)) {
        return {
            ...player,
            state: PlayerState.Running
        }
    }

    return player
}

const running = (
    game: GameStatus, 
    player: PlayerStatus, 
    topX: number, 
    maxX: number): PlayerStatus => {
    if (!(game.input.left && game.input.right)) {
        if ((game.input.left && player.xpos - 5 < topX)
            || (game.input.right && (player.xpos * 2) + 5 > maxX)) {
            return player
        }

        if (game.input.left) {
            return {
                    ...player,
                    state: PlayerState.Running,
                    xpos: player.xpos - player.speed
                }
        } else if (game.input.right) {
            return {
                    ...player,
                    state: PlayerState.Running,
                    xpos: player.xpos + player.speed
                }
        }
    }

    return {
        ...player,
        state: PlayerState.Idle
    }
}

export { idle, running }
