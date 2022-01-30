import { ExDrawText } from "./exDrawText";
import { ExDrawCircle } from "./exDrawCircle";
import _flatten from "lodash/flatten";

const baselineHeight = 18;
const padding = 6;
const baseX = 5;
const baseY = 30;

export class ExDrawLabels {
  constructor({ names, direction, group, position: [x, y] } = {}) {
    this.direction = direction;
    this.nodes = names.map((title, index) => {
      return [
        new ExDrawCircle({ group, position: [0, 0] }),
        new ExDrawText({ title, group, position: [0, 0] })
      ];
    });
  }
  setPosition(x, y) {
    this.nodes.forEach(([circle, text], index) => {
      const labelX = x + baseX;
      const labelY = y + baseY + index * (baselineHeight + padding);
      const textOffsetY = -5;
      const circleOffsetY = 5;
      if (this.direction === "left") {
        circle.setPosition(labelX, labelY + circleOffsetY);
        text.setPosition(labelX + 15, labelY + textOffsetY);
      } else {
        const textWidth = text.getTextWidth();
        circle.setPosition(labelX + 110, labelY + circleOffsetY);
        text.setPosition(labelX + 110 - textWidth, labelY + textOffsetY);
      }
    });
  }
  getLinkPosition(index) {
    return this.getLinkCircle(index).getPosition();
  }
  getLinkCircle(index) {
    const pair = this.nodes[index];
    if (!pair) {
      console.log(this.nodes, this.direction);
      return null;
    }
    return this.direction === "left" ? pair[0] : pair[1];
  }
  get() {
    const nodes = _flatten(this.nodes).map((el) => el.get());
    return nodes;
  }
}
