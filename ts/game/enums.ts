enum GameState {
    StartScreen,
    Playing,
    Paused,
    GameOver
}

enum PlayerState {
    Hidden,
    Idle,
    Running
}

enum Entity {
    Bug,
    Star
}

export { GameState, PlayerState, Entity }
