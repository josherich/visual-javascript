import _uniqueId from "lodash/uniqueId";
import { ExDrawElement } from "./exDrawElement";
import { ExDrawText } from "./exDrawText";
import { ExDrawLabels } from "./exDrawLabels";

/* ExDrawBlock can include frame, title, inputs, outputs and control flow blocks */
export class ExDrawBlock {
  constructor({ title = "statement", inputs = [], outputs = [], controlFlows = [] } = {}) {
    this.title = title;
    this.groupId = _uniqueId("groupId");
    this.x = 0;
    this.y = 0;
    this.frame = new ExDrawElement({
      type: "rectangle",
      group: this.groupId,
      position: [this.x, this.y]
    });
    this.title = new ExDrawText({
      title,
      group: this.groupId,
      position: [this.x, this.y]
    });
    this.inputs = new ExDrawLabels({
      names: inputs,
      direction: "left",
      group: this.groupId,
      position: [this.x, this.y]
    });
    this.outputs = new ExDrawLabels({
      names: outputs,
      direction: "right",
      group: this.groupId,
      position: [this.x, this.y]
    });
    if (controlFlows.length > 0) {
      console.log('controlFlows', controlFlows);
      this.controlFlows = new ExDrawLabels({
        names: controlFlows,
        direction: "right",
        group: this.groupId,
        position: [this.x, this.y]
      });
    }
  }
  get() {
    return [
      this.frame.get(),
      this.title.get(),
      ...this.inputs.get(),
      ...this.outputs.get(),
      ...this.controlFlows ? this.controlFlows.get() : [],
    ];
  }
  id() {
    return this.frame.id;
  }
  getPosition() {
    return this.frame.getPosition();
  }
  getInputPosition(index) {
    return this.inputs.getLinkPosition(index);
  }
  getOutputPosition(index) {
    return [
      this.frame.getPosition()[0] + this.frame.width,
      this.outputs.getLinkPosition(index)[1]
    ];
  }
  getControlFlowInPosition() {
    return [this.frame.getPosition()[0], this.frame.getPosition()[1] + 40];
  }
  getControlFlowOutPosition(index) {
    return [
      this.frame.getPosition()[0] + this.frame.width,
      this.controlFlows.getLinkPosition(index)[1]
    ];
  }
  setPosition(x, y) {
    this.frame.setPosition(x, y);
    this.title.setPosition(x, y);
    this.inputs.setPosition(x, y);
    this.outputs.setPosition(x, y);
    if (this.controlFlows) this.controlFlows.setPosition(x, y);
  }
  link(arrow) {
    if (!this.frame.boundElementIds) {
      this.frame.boundElementIds = [];
    }
    if (this.frame.boundElementIds.includes(arrow.id)) return;
    this.frame.boundElementIds.push(arrow.id);
  }
}
