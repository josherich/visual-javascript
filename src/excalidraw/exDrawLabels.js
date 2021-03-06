import { ExDrawText } from "./exDrawText";
import { ExDrawCircle } from "./exDrawCircle";
import _flatten from "lodash/flatten";

const BASELINEHEIGHT = 18;
const PADDING = 0;
const baseX = 5;
const baseY = 18;

export class ExDrawLabels {
  constructor({
    names,
    direction,
    group,
    position: [x, y],
    offset: [w, h] = [110, 100],
  } = {}) {
    this.names = names;
    this.direction = direction;
    this.offset = [w, h];
    this.nodes = names.map((title, index) => {
      return [
        new ExDrawCircle({ group, position: [0, 0] }),
        new ExDrawText({ title, group, position: [0, 0] }),
      ];
    });
  }

  /*
  ** ========== public get ==========
  */
  get() {
    const nodes = _flatten(this.nodes).map((el) => el.get());
    return nodes;
  }

  /*
  ** ========== UI get ==========
  */
  getLinkPosition(index) {
    return this.getLinkCircle(index).getPosition();
  }
  getLinkCircle(index) {
    const pair = this.nodes[index];
    if (!pair) {
      return null;
    }
    return this.direction === "left" ? pair[0] : pair[1];
  }
  getSize() {
    return [
      this.nodes.length === 0
        ? 0
        : Math.max(
            ...this.nodes.map(
              (node) => node[1].getSize()[0] + node[0].getSize()[0] + baseX * 3
            )
          ),
      this.nodes.length * (BASELINEHEIGHT + PADDING),
    ];
  }

  /*
  ** ========== public set ==========
  */
  setPosition(x, y, offset) {
    let [w, h] = offset || this.offset;
    this.nodes.forEach(([circle, text], index) => {
      const labelX = x + baseX;
      const labelY = y + baseY + index * (BASELINEHEIGHT + PADDING);
      const textOffsetY = -5;
      const circleOffsetY = 5;
      if (this.direction === "left") {
        circle.setPosition(labelX, labelY + circleOffsetY);
        text.setPosition(labelX + 25, labelY + textOffsetY);
      } else {
        const textWidth = text.getTextWidth();
        circle.setPosition(labelX + w - 25, labelY + circleOffsetY);
        text.setPosition(labelX + w - 25 - textWidth, labelY + textOffsetY);
      }
    });
  }
}
