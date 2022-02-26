import { Block } from "./block";
import { ExDrawBlock } from "../excalidraw/exDrawBlock";
import _flattenDeep from "lodash/flattenDeep";
import _flatten from "lodash/flatten";
import _uniqueId from "lodash/uniqueId";

const BLOCK_GROUP_WIDTH = 340;
const BLOCK_GROUP_PADDING = 40;
const BLOCK_HEIGHT = 100;

import {
  parseInputs,
  parseOutputs,
  parseMutation,
  parseEditData,
  setNode,
} from "./blockParser";

export class BlockGroup {
  constructor({ nodes, keysInScope, getCode, unfolded = false }={}) {
    this.nodes = nodes;
    this.keysInScope = keysInScope;
    this.getCode = getCode;
    this.unfolded = false;

    this.groupId = _uniqueId("blockGroup");
    this.groupName = this.getGroupTitle();

    // this.background = new Block(null, keysInScope);
    this.blocks = this.parseBlocks(nodes, keysInScope);
    this.inputs = this.parseInputs(nodes, keysInScope);
    this.outputs = this.parseOutputs(nodes, keysInScope);
    this.editData = parseEditData(nodes);
    this.mutations = this.parseMutations(nodes, keysInScope);
    this.controlFlowBlocks = [];

    this.exBlocks = [];
    this.drawBlock();
  }

  drawBackground() {
    this.backgroundBlock = new ExDrawBlock({
      title: this.groupName,
      inputs: this.getInputs(),
      outputs: this.getOutputs(),
      groupId: this.groupId,
      isGroup: true,
      size: [BLOCK_GROUP_WIDTH, this.getContentSize()[1] + BLOCK_GROUP_PADDING],
    });
    // this.backgroundBlock.setSize(BLOCK_GROUP_WIDTH, BLOCK_GROUP_PADDING * 2 + this.blocks.length * BLOCK_HEIGHT);
  }

  drawBlock() {
    this.drawBackground();
  }

  // action
  unfold() {
    this.unfolded = true;
    this.drawBlock();
  }
  fold() {
    this.unfolded = false;
    this.drawBlock();
  }

  /*
  ** 1. public get
  */
  id() {
    return this.backgroundBlock.id();
  }
  linkId() {
    return this.backgroundBlock.linkId();
  }
  get() {
    return _flattenDeep([this.backgroundBlock.get(), this.blocks.map(block => block.get())]);
    // return _flattenDeep([this.backgroundBlock.get(), this.unfolded ? this.blocks.map(block => block.get()) : []]);
  }
  getGroupId() {
    return this.backgroundBlock.groupId;
  }
  getNode() {
    return this.nodes;
  }
  getGroupTitle() {
    return "Statement Group";
  }
  getInputs() {
    return Array.from(new Set(this.unfolded ? this.inputs : _flattenDeep(this.inputs)));
  }
  getOutputs() {
    return Array.from(new Set(this.unfolded ? this.outputs : _flattenDeep(this.outputs)));
  }
  getMutations() {
    return this.mutations.filter(e => e);
  }
  title() {
    return this.groupName;
  }
  getBreakReturnBlocks() {
    return []
  }
  getEditData() {
    if (this.name === "VariableDeclaration") {
      return this.editData;
    }
    return null;
  }

  /*
  ** 2. UI getter
  */
  getInputPosition(index) {
    return this.backgroundBlock.getInputPosition(index);
  }
  getOutputPosition(index) {
    return this.backgroundBlock.getOutputPosition(index);
  }
  getMutationPosition(index) {
    return this.backgroundBlock.getMutationPosition(index);
  }
  getControlFlowInPosition() {
    let [x, y] = this.backgroundBlock.getPosition();
    return [x, y + this.getSize()[1] / 2];
  }
  getControlFlowOutPosition(index) {
    let [x, y] = this.backgroundBlock.getPosition();
    let [w, h] = this.backgroundBlock.getSize();
    return [x + w, y + this.getSize()[1] / 2];
  }
  getPosition() {
    return this.backgroundBlock.getPosition();
  }
  getSize() {
    return this.backgroundBlock.getSize();
  }
  getContentSize() {
    return this.blocks.reduce((acc, block) => {
      const [w, h] = block.getSize();
      return [Math.max(acc[0], w), acc[1] + h + 10 * 2, ];
    }, [0, 0]);
  }

  /*
  ** 3. Boolean getter
  */

  /*
  ** 4. public setter
  */
  edit(path, value) {
    setNode(this.nodes, path, value);
  }
  setLayoutNode(node) {
    this.layoutNode = node;
  }
  setPosition(x, y) {
    this.backgroundBlock.setPosition(x, y);
    const offsetX = this.backgroundBlock.getContentOffset()[0];
    this.blocks.forEach((block, index) => {
      if (index === 0) {
        block.setPosition(x + offsetX, y + 40);
      } else {
        const [_x, _y] = this.blocks[index - 1].getPosition();
        const [w, h] = this.blocks[index - 1].getSize();
        block.setPosition(x + offsetX, _y + 10 + h);
      }
    });
  }
  followPosition(block, transformer) {
    const pos = transformer(...block.getPosition());
    this.setPosition(...pos);
  }
  link(arrow) {
    this.backgroundBlock.link(arrow);
  }

  /*
  ** private
  */
  parseBlocks(nodes, keysInScope) {
    return nodes.map((node) => {
      return new Block({node, keysInScope, getCode: this.getCode, groupId: this.groupId});
    });
  }
  parseInputs(nodes) {
    return nodes.map((node) => {
      return parseInputs(node);
    });
  }
  parseOutputs(nodes, keysInScope) {
    return nodes.map((node) => {
      return parseOutputs(node, keysInScope);
    });
  }
  parseMutations(nodes) {
    return nodes.map((node) => {
      return parseMutation(node);
    });
  }

}
