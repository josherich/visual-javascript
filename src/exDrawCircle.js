import { ExDrawElement } from "./exDrawElement";

export class ExDrawCircle extends ExDrawElement {
  constructor({ group, position: [x, y] } = {}) {
    super({
      type: "ellipse",
      group
    });
    let w = 10,
      h = 10;
    this.setSize(w, h);

    this.setPosition(x, y);
  }
  setSize(w, h) {
    this.width = w;
    this.height = h;
  }
  setPosition(x, y) {
    this.x = x + 5;
    this.y = y;
  }
  getPosition() {
    return [this.x, this.y];
  }
  get() {
    return Object.assign({}, this, ExDrawElement.prototype.base.call(this));
  }
}
