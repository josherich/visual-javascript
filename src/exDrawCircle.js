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
  // getter
  getPosition() {
    return [this.x, this.y];
  }
  get() {
    return Object.assign({}, this, ExDrawElement.prototype.base.call(this));
  }
  getSize() {
    return [this.width + 5, this.height];
  }
  // setter
  setSize(w, h) {
    this.width = w;
    this.height = h;
  }
  setPosition(x, y) {
    this.x = x + 5;
    this.y = y;
  }
}
