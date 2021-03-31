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

// Numbers are listed for quick reference
enum ImageIndex {
    PlayerIdle = 0,
    PlayerRunLeft = 1,
    PlayerRunRight = 2,
    Star = 3
}

export { GameState, PlayerState, EntityType, ImageIndex }
