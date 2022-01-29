import { Block } from "./block";
import { ExDrawBlock } from "./exDrawBlock";
import _flattenDeep from "lodash/flattenDeep";

import {
  parseInputs,
  parseOutputs,
  parseMutation,
  parseControlFlows,
  parseBlockType,
  parseSourceCode,
  getCodeInTitle,
} from "./blockParser";

export class BlockGroup {
  constructor(nodes, keysInScope, unfolded = false) {
    this.unfolded = false;
    this.groupName = "Group Name";
    this.keysInScope = keysInScope;

    // this.background = new Block(null, keysInScope);
    this.blocks = this.parseBlocks(nodes, keysInScope);
    this.inputs = this.parseInputs(nodes, keysInScope);
    this.outputs = this.parseOutputs(nodes, keysInScope);
    this.mutations = this.parseMutations(nodes, keysInScope);

    this.exBlocks = [];
    if (this.unfolded) {
      this.drawBlocks();
    } else {
      this.drawBlock();
    }
  }
  drawBackground() {
    this.backgroundBlock = new ExDrawBlock({
      title: this.groupName,
      inputs: this.inputs,
      outputs: this.outputs,
    });
  }
  drawBlocks() {
    this.drawBackground();
  }
  drawBlock() {
    this.drawBackground();
  }

  // action
  unfold() {
    this.unfolded = true;
  }
  fold() {
    this.unfolded = false;
  }

  // getter
  id() {
    return this.backgroundBlock.id();
  }
  get() {
    return [this.backgroundBlock.get()];
  }
  getInputs() {
    return this.unfolded ? this.inputs : _flattenDeep(this.inputs);
  }
  getOutputs() {
    return this.unfolded ? this.outputs : _flattenDeep(this.outputs);
  }
  title() {
    return this.groupName;
  }
  getInputPosition(index) {
    return this.backgroundBlock.getInputPosition(index);
  }
  getMutationPosition(index) {
    return this.backgroundBlock.getMutationPosition(index);
  }
  getPosition() {
    return this.backgroundBlock.getPosition();
  }

  // setter
  setLayoutNode(node) {
    this.layoutNode = node;
  }
  setPosition(x, y) {
    if (this.unfolded) {
      this.backgroundBlock.setPosition(x, y);
    }
    this.blocks.forEach((block) => {
      block.setPosition(x, y);
    });
  }
  followPosition(block, transformer) {
    const pos = transformer(...block.getPosition());
    this.setPosition(...pos);
  }
  link(arrow) {
    this.backgroundBlock.link(arrow);
  }

  // private
  parseBlocks(nodes, keysInScope) {
    return nodes.map((node) => {
      return new Block(node, keysInScope);
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
