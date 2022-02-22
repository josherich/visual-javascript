// import { times } from "lodash";
import _uniqueId from "lodash/uniqueId";

const BLOCK_WIDTH = 140;
const BLOCK_HEIGHT = 100;
export class ExDrawElement {
  constructor({
    type = "rectangle",
    style = "solid",
    group,
    backgroundColor = "transparent",
  } = {}) {
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.strokeWidth = 1;
    this.strokeStyle = style;
    this.fillStyle = "hachure";
    this.strokeColor = "#000000";
    this.strokeSharpness = "sharp";
    this.backgroundColor = backgroundColor;
    this.roughness = 0;
    this.opacity = 100;
    this.width = BLOCK_WIDTH;
    this.height = BLOCK_HEIGHT;
    this.angle = 0;
    this.boundElements = null;

    this.id = _uniqueId(this.type);
    this.seed = Date.now();

    if (group) this.joinGroup(group);
  }
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  setSize(width, height) {
    this.width = width;
    this.height = height;
  }
  getPosition() {
    return [this.x, this.y];
  }
  getSize() {
    return [this.width, this.height];
  }
  joinGroup(groupId) {
    this.groupId = groupId;
  }
  base() {
    return {
      ...(this.groupId ? { groupIds: [this.groupId] } : { groupIds: [] }),
      version: 1,
      verisonNonce: 1,
      isDeleted: false,
    };
  }
  get() {
    return Object.assign({}, this, this.base());
  }
}
