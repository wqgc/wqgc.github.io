import { GameStatus, PlayerStatus } from '../types'
import { PlayerState } from '../enums'

const idle = ( prevGame: GameStatus, prevPlayer: PlayerStatus): PlayerStatus => {
    // If one run input is pressed, update state
    if (!(prevGame.input.left && prevGame.input.right) 
        && (prevGame.input.left || prevGame.input.right)) {
        return {
            ...prevPlayer,
            state: PlayerState.Running
        }
    }

    return prevPlayer
}

const running = (
    prevGame: GameStatus, 
    prevPlayer: PlayerStatus, 
    startX: number, 
    maxX: number): PlayerStatus => {
    if (!(prevGame.input.left && prevGame.input.right)) {
        if ((prevGame.input.left && prevPlayer.xpos - 5 < startX)
            || (prevGame.input.right && (prevPlayer.xpos * 2) + 5 > maxX)) {
            return prevPlayer
        }

        if (prevGame.input.left) {
            return {
                    ...prevPlayer,
                    state: PlayerState.Running,
                    xpos: prevPlayer.xpos - prevPlayer.speed
                }
        } else if (prevGame.input.right) {
            return {
                    ...prevPlayer,
                    state: PlayerState.Running,
                    xpos: prevPlayer.xpos + prevPlayer.speed
                }
        }
    }

    return {
        ...prevPlayer,
        state: PlayerState.Idle
    }
}

export { idle, running }
