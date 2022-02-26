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
  /*
  ** ========== public get ==========
  */
  get() {
    return Object.assign({}, this, ExDrawElement.prototype.base.call(this));
  }

  /*
  ** ========== UI get ==========
  */
  getPosition() {
    return [this.x, this.y];
  }

  getSize() {
    return [this.width + 5, this.height];
  }

  /*
  ** ========== public set ==========
  */
  setSize(w, h) {
    this.width = w;
    this.height = h;
  }
  setPosition(x, y) {
    this.x = x + 5;
    this.y = y;
  }
}
