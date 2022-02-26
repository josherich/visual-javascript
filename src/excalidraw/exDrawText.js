import { ExDrawElement } from "./exDrawElement";

export class ExDrawText extends ExDrawElement {
  constructor({ title, group, position: [x, y] } = {}) {
    super({
      type: "text",
      group
    });
    this.type = "text";
    this.text = title;
    this.originalText = title;
    this.baseline = 18;
    this.textAlign = "left";
    this.fontSize = 12;
    this.fontFamily = 3;
    this.width = 6.5 * this.text.length + 5;
    this.height = this.baseline;
    this.verticalAlign = "top";
    this.setPosition(x, y);
  }

  /*
  ** public get
  */
  get() {
    return Object.assign({}, this, ExDrawElement.prototype.base.call(this));
  }

  /*
  ** UI get
  */
  getPosition() {
    return [this.x, this.y];
  }
  getTextWidth() {
    return this.text.length * 6.5 + 5;
  }
  getSize() {
    return [this.width, this.height];
  }

  /*
  ** public set
  */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}
