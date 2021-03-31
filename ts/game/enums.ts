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

enum EntityType {
    Bug,
    Star
}

enum ImageIndex {
    PlayerIdle = 0,
    PlayerRunLeft = 1,
    PlayerRunRight = 2
}

export { GameState, PlayerState, EntityType, ImageIndex }
