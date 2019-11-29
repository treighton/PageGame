import "phaser";

import SimpleScene from "./scenes/SimpleScene";

const gameConfig = {
  width: 680,
  height: 680,
  scene: SimpleScene,
  parent: "game_id"
};

new Phaser.Game(gameConfig);
