import "phaser";

import SimpleScene from "./scenes/SimpleScene";

const gameConfig = {
  width: 800,
  height: 400,
  scene: SimpleScene,
  parent: "game_id",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(gameConfig);
