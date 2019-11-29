import coke from "../assets/cokecan.png";

class SimpleScene extends Phaser.Scene {
  preload() {
    this.load.image("coke", coke);
  }
  create() {
    this.add.text(100, 100, "YO BITCH", { fill: "#0f0" });
    this.add.image(100, 200, "coke");
  }
}

export default SimpleScene;
