// import { times } from "lodash";
import _uniqueId from "lodash/uniqueId";

export class ExDrawElement {
  constructor({ type = "rectangle", style="solid", group } = {}) {
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.strokeWidth = 1;
    this.strokeStyle = style;
    this.fillStyle = "hachure";
    this.strokeColor = "#000000";
    this.strokeSharpness = "sharp";
    this.backgroundColor = "transparent";
    this.roughness = 0;
    this.opacity = 100;
    this.width = 140;
    this.height = 100;
    this.angle = 0;
    this.boundElements = null;

    this.id = _uniqueId("id");
    this.seed = Date.now();

    if (group) this.joinGroup(group);
  }
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  getPosition() {
    return [this.x, this.y];
  }
  joinGroup(groupId) {
    this.groupId = groupId;
  }
  base() {
    return {
      ...(this.groupId ? { groupIds: [this.groupId] } : { groupIds: [] }),
      version: 1,
      verisonNonce: 1,
      isDeleted: false
    };
  }
  get() {
    console.log(this.base().groupIds);
    return Object.assign({}, this, this.base());
  }
}
