import { ExDrawElement } from "./exDrawElement";

export class ExDrawArrow extends ExDrawElement {
  constructor({
    type = 'sequence',
    startPosition: [x, y],
    endPosition: [ex, ey],
    startElement,
    endElement,
    style="solid",
  } = {}) {
    super({
      type: "arrow",
      style,
    });
    this.arrowType = type;
    this.width = 148;
    this.height = 8;

    this.points = [];
    this.startBinding = {
      elementId: startElement,
      focus: -0.35,
      gap: 8.86
    };
    this.endBinding = {
      elementId: endElement,
      focus: 0.07,
      gap: 8.6
    };
    this.startArrowhead = null;
    this.endArrowhead = "arrow";
    this.lastCommittedPoint = null;
    if (this.arrowType !== 'sequence') {
      this.opacity = 30;
    }

    this.setPosition(x, y, ex, ey);
  }

  get() {
    return Object.assign({}, this, ExDrawElement.prototype.base.call(this));
  }

  setPosition(x, y, ex, ey) {
    this.x = x;
    this.y = y;
    this.points[0] = [0, 0];
    this.points[1] = [ex - x, ey - y];
  }
}
