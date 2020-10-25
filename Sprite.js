class Sprite {
  constructor(x, y, w = null, h = null, ratio = null, power) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.ratio = ratio;

    this.painter = null;
    this.behaviors = [];
  }

  //=== Method ===
  paint(context) {
    this.painter.paint(context, this.x, this.y, this.width, this.height);
  }

  exec() {
    this.behaviors.forEach(b => {
      if(b.enable) b.exec(this);
    });
  }
}
