import { Block } from "./block";
import { ExDrawBlock } from "./exDrawBlock";
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
  parseControlFlows,
  parseBlockType,
  parseSourceCode,
  getCodeInTitle,
} from "./blockParser";

export class BlockGroup {
  constructor({nodes, keysInScope, getCode, unfolded = false}={}) {
    this.unfolded = false;
    this.groupName = "Group Name";
    this.nodes = nodes;
    this.getCode = getCode;
    this.keysInScope = keysInScope;
    this.groupId = _uniqueId("blockGroup");

    // this.background = new Block(null, keysInScope);
    this.blocks = this.parseBlocks(nodes, keysInScope);
    this.inputs = this.parseInputs(nodes, keysInScope);
    this.outputs = this.parseOutputs(nodes, keysInScope);
    this.mutations = this.parseMutations(nodes, keysInScope);

    this.exBlocks = [];
    this.drawBlock();
  }
  drawBackground() {
    this.backgroundBlock = new ExDrawBlock({
      title: this.groupName,
      // content: this.nodes.map(this.getCode).join("\n"),
      inputs: this.unfolded ? this.inputs : _flattenDeep(this.inputs),
      outputs: this.unfolded ? this.outputs : _flattenDeep(this.outputs),
      groupId: this.groupId,
      isGroup: true,
    });
    this.backgroundBlock.setSize(BLOCK_GROUP_WIDTH, BLOCK_GROUP_PADDING * 2 + this.blocks.length * BLOCK_HEIGHT);
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

  // getter
  id() {
    return this.backgroundBlock.id();
  }
  get() {
    return _flattenDeep([this.backgroundBlock.get(), this.blocks.map(block => block.get())]);
    // return _flattenDeep([this.backgroundBlock.get(), this.unfolded ? this.blocks.map(block => block.get()) : []]);
  }
  getInputs() {
    return this.unfolded ? this.inputs : _flattenDeep(this.inputs);
  }
  getOutputs() {
    return this.unfolded ? this.outputs : _flattenDeep(this.outputs);
  }
  getMutations() {
    return this.mutations.filter(e => e);
  }
  title() {
    return this.groupName;
  }
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
    return [x, y + 140];
  }
  getPosition() {
    return this.backgroundBlock.getPosition();
  }

  // setter
  setLayoutNode(node) {
    this.layoutNode = node;
  }
  setPosition(x, y) {
    this.backgroundBlock.setPosition(x, y);
    this.blocks.forEach((block, index) => {
      block.setPosition(x + 20, y + 40 + index * 120);
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
