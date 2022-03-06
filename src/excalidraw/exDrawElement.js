import _uniqueId from "lodash/uniqueId";

const BLOCK_WIDTH = 140;
const BLOCK_HEIGHT = 100;
export class ExDrawElement {
  constructor({
    type = "rectangle",
    style = "solid",
    group,
    backgroundColor = "transparent",
    borderColor = "#000000",
  } = {}) {
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.strokeWidth = 1;
    this.strokeStyle = style;
    this.fillStyle = "hachure";
    this.strokeColor = borderColor;
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

  /*
  ** public get
  */
  base() {
    const groupIds = Array.isArray(this.groupId) ? this.groupId : [this.groupId].filter(e => e);
    return {
      groupIds,
      version: 1,
      verisonNonce: 1,
      isDeleted: false,
    };
  }
  get() {
    return Object.assign({}, this, this.base());
  }

  /*
  ** UI get
  */
  getPosition() {
    return [this.x, this.y];
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
  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  joinGroup(groupId) {
    this.groupId = groupId;
  }

}
