import background from "../assets/background.png";
import playerimg from "../assets/player.png";
import playerSprite from "../assets/HC_Humans1B.png";
import enemy from "../assets/dragon.png";
import batSheet from "../assets/Bat_Sprite_Sheet.png";
import treasure from "../assets/treasure.png";
import map from "../assets/officeLevel.json";
import exteriorTiles from "../assets/PHC-A4-Exterior.png";
import exteriorGeneral from "../assets/TileA5_PHC_Exterior-General.png";
import exteriorNature from "../assets/TileA5_PHC_Exterior-Nature.png";
import office from "../assets/TileC_PHC_Interior-Office&Facility.png";
import windows from "../assets/TileD_PHC_Exterior-Windows&Doors.png";

class SimpleScene extends Phaser.Scene {
  player = null;
  enemies = null;
  goal = null;
  cursors = null;

  init() {
    this.playerSpeed = 5;
    this.enemyMinSpeed = 3;
    this.enemyMaxSpeed = 5;
    this.enemyMinY = 80;
    this.enemyMaxY = 280;
    this.isTerminating = false;
    this.map;
  }

  preload() {
    this.load.image("background", background);
    this.load.tilemapTiledJSON("map", map);
    this.load.image("tiles", exteriorTiles);
    this.load.image("nature", exteriorNature);
    this.load.image("exterior", exteriorGeneral);
    this.load.image("windows", windows);
    this.load.image("office", office);
    this.load.spritesheet("player", playerSprite, {
      frameWidth: 16,
      frameHeight: 32
    });
    this.load.image("enemy", enemy);
    this.load.image("goal", treasure);
    this.load.spritesheet("bat", batSheet, {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  create() {
    //set up background
    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("PHC-A4-Exterior", "tiles");
    const nature = this.map.addTilesetImage("Ext General", "exterior");
    const general = this.map.addTilesetImage("Ext Nature", "nature");
    const officeTiles = this.map.addTilesetImage(
      "TileC_PHC_Interior-Office&Facility",
      "office"
    );
    const windowTiles = this.map.addTilesetImage(
      "TileD_PHC_Exterior-Windows&Doors",
      "windows"
    );
    this.map.createStaticLayer("Ground", [tileset, general, nature]);
    const desks = this.map.createStaticLayer("Desks", officeTiles);
    this.map.createStaticLayer("windows", [windowTiles, officeTiles]);
    desks.setCollisionByProperty({ Goal: true });

    //add player
    this.player = this.physics.add.sprite(70, 200, "player");

    this.physics.add.collider(
      desks,
      this.player,
      () => console.log("win"),
      null,
      this
    );
    //enemeies
    this.enemies = this.add.group({
      key: "bat",
      repeat: 8,
      setXY: {
        x: 140,
        y: 100,
        stepX: 60,
        stepY: 20
      }
    });

    const anims = this.anims;

    anims.create({
      key: "fly",
      frames: anims.generateFrameNames("bat", { start: 1, end: 5 }),
      frameRate: 10,
      repeat: 1
    });

    anims.create({
      key: "player",
      frames: anims.generateFrameNames("player", { start: 30, end: 31 }),
      frameRate: 5,
      repeat: 1
    });

    Phaser.Actions.Call(
      this.enemies.getChildren(),
      enemy => {
        enemy.flipX = true;
        let dir = Math.random() < 0.5 ? 1 : -1;
        let speed =
          this.enemyMinSpeed +
          Math.random() * (this.enemyMinSpeed - this.enemyMaxSpeed);
        enemy.speed = speed * dir;
      },
      this
    );

    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    this.player.body.setVelocity(0);
    if (this.isTerminating) return;
    this.cursors = this.input.keyboard.createCursorKeys();

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-100);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(100);
    } else if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-100);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(100);
    }

    if (this.input.activePointer.isDown) {
      this.player.x += this.playerSpeed;
    }

    let enemyGroup = this.enemies.getChildren();
    let playerRect = this.player.getBounds();
    let goalPoint = this.map.findObject("Goal", obj => obj.name === "Goal");

    this.player.anims.play("player", true);

    enemyGroup.forEach(enemy => {
      // enemy movement
      enemy.y += enemy.speed;
      enemy.anims.play("fly", true);
      // check we haven't passed min or max Y
      let conditionUp = enemy.speed < 0 && enemy.y <= this.enemyMinY;
      let conditionDown = enemy.speed > 0 && enemy.y >= this.enemyMaxY;
      let enemyRect = enemy.getBounds();

      // if we passed the upper or lower limit, reverse
      if (conditionUp || conditionDown) {
        enemy.speed *= -1;
      }

      if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
        return this.lose();
      }
    });

    if (
      Phaser.Geom.Intersects.RectangleToValues(
        playerRect,
        goalPoint.x,
        goalPoint.x + 10,
        goalPoint.y,
        goalPoint.y + 10,
        10
      )
    ) {
      return this.win();
    }
  }

  win() {
    this.isTerminating = true;
    this.add.text(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      "YOU WIN!!!",
      {
        fill: "#0f0"
      }
    );
    this.cameras.main.fade(500);
    this.cameras.main.on(
      "camerafadeoutcomplete",
      function(camera, effect) {
        // restart the Scene
        this.scene.restart();
      },
      this
    );
  }

  lose() {
    this.isTerminating = true;
    this.cameras.main.shake(250);
    this.cameras.main.on(
      "camerashakecomplete",
      function(camera, effect) {
        // restart the Scene
        this.cameras.main.fade(500);
      },
      this
    );
    this.cameras.main.on(
      "camerafadeoutcomplete",
      function(camera, effect) {
        // restart the Scene
        this.scene.restart();
      },
      this
    );
  }
}

export default SimpleScene;
