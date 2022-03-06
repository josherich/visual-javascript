import _uniqueId from "lodash/uniqueId";
import { ExDrawElement } from "./exDrawElement";
import { ExDrawText } from "./exDrawText";
import { ExDrawLabels } from "./exDrawLabels";

/* ExDrawBlock can include frame, title, inputs, outputs and control flow blocks */
export class ExDrawBlock {
  constructor({
    title = "statement",
    content = null,
    inputs = [],
    outputs = [],
    controlFlows = [],
    groupId = _uniqueId("ui-block-"),
    isGroup = false,
    isControlFlow = false,
    size: [w, h] = [140],
    textMode = false,
  } = {}) {
    this.textMode = textMode;

    this.title = title;
    this.groupId = groupId;
    this.isGroup = isGroup;
    this.x = 0;
    this.y = 0;
    this.frame = new ExDrawElement({
      type: "rectangle",
      group: this.groupId,
      position: [this.x, this.y],
      borderColor: this.textMode ? "#eeeeee" : "#000000",
      backgroundColor: isGroup ? "#ced4da" : "transparent",
    });

    this.title = new ExDrawText({
      title,
      group: this.groupId,
      position: [this.x, this.y],
    });
    this.inputs = new ExDrawLabels({
      names: inputs,
      direction: "left",
      group: this.groupId,
      position: [this.x, this.y],
      offset: [w, h],
    });
    this.outputs = new ExDrawLabels({
      names: outputs,
      direction: "right",
      group: this.groupId,
      position: [this.x, this.y],
      offset: [w, h],
    });
    if (content) {
      this.content = new ExDrawText({
        title: content,
        group: this.groupId,
        position: [this.x + 10, this.y + 18],
      });
    }

    if (controlFlows.length > 0) {
      this.controlFlows = new ExDrawLabels({
        names: controlFlows,
        direction: "right",
        group: this.groupId,
        position: [this.x, this.y],
        offset: [w, h],
      });
    }

    if (isControlFlow) {
      this.frame.setSize(140, 60);
    } else {
      this.setSize(w, h);
    }
  }

  /*
  ** ========== public get ==========
  */
  get() {
    if (this.textMode && !this.isGroup) {
      return [
        this.frame.get(),
        this.content.get()
      ]
    } else if (this.textMode && this.isGroup) {
      return [
        this.frame.get(),
      ];
    } else {
      return [
        this.frame.get(),
        this.title.get(),
        this.content ? this.content.get() : [],
        ...this.inputs.get(),
        ...this.outputs.get(),
        ...(this.controlFlows ? this.controlFlows.get() : []),
      ];
    }
  }
  id() {
    return this.groupId;
  }
  linkId() {
    return this.frame.id;
  }

  /*
  ** ========== UI get ==========
  */
  getSize() {
    return this.frame.getSize();
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
      this.outputs.getLinkPosition(index)[1],
    ];
  }
  getContentOffset() {
    return [Math.max(this.inputs.getSize()[0], 20), this.title.getSize()[1]];
  }
  getControlFlowInPosition() {
    return [this.frame.getPosition()[0], this.frame.getPosition()[1] + 40];
  }
  getControlFlowOutPosition(index) {
    const outY =
      index === undefined
        ? this.frame.getPosition()[1] + 40
        : this.controlFlows.getLinkPosition(index)[1];
    return [this.frame.getPosition()[0] + this.frame.width, outY];
  }
  getMutationPosition() {
    return this.frame.getPosition();
  }

  /*
  ** ========== public set ==========
  */
  setSize(width, height) {
    if (this.textMode && !this.isGroup) {
      this.frame.setSize(...this.content.getSize());
      return;
    }
    const bottomPadding = 10;
    const adjustedWidth = Math.max(
      this.inputs.getSize()[0] + width + this.outputs.getSize()[0],
      this.title.getSize()[0] + 20
    );
    const adjustedHeight =
      Math.max(
        this.inputs.getSize()[1],
        this.outputs.getSize()[1],
        this.controlFlows ? this.controlFlows.getSize()[1] : 0,
        this.content ? this.content.getSize()[1] : 0,
        height || 0
      ) +
      this.title.getSize()[1] +
      bottomPadding;
    this.frame.setSize(adjustedWidth, adjustedHeight);
  }
  setPosition(x, y) {
    if (this.textMode && !this.isGroup) {
      this.frame.setPosition(x, y);
      this.content.setPosition(x + 1, y - 3);
      return;
    }
    const titleOffsetX = 5;
    const titleOffsetY = 0;

    const contentOffsetX = 5;
    const contentOffsetY = 26;

    const inputOffsetX = 5;
    const inputOffsetY = 26;

    const controlFlowOffsetX = 5;
    const controlFlowOffsetY = 26;

    this.frame.setPosition(x, y);
    this.title.setPosition(x + 5, y);
    this.inputs.setPosition(x, y);
    this.outputs.setPosition(x, y, this.getSize());

    if (this.content) this.content.setPosition(x + 5, y + 26);
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
