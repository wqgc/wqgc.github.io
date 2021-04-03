enum GameState {
    StartScreen,
    Playing,
    Paused,
    GameOver
}

enum PlayerState {
    Idle,
    Running
}

// I'm matching types up with their image index for more concise code
enum EntityType {
    Player = 0,
    Meteor = 4,
    Meteor2 = 5,
    UFO = 6,
    Star = 3,
    StarCaught = 7
}

// Numbers are listed for quick reference
enum ImageIndex {
    PlayerIdle = 0,
    PlayerRunLeft = 1,
    PlayerRunRight = 2,
    Star = 3,
    Meteor = 4,
    Meteor2 = 5,
    UFO = 6,
    StarCaught = 7
}

export { GameState, PlayerState, EntityType, ImageIndex }
