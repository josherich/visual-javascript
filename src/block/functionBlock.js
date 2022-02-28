import _flattenDeep from "lodash/flattenDeep";
import _flatten from "lodash/flatten";
import _uniqueId from "lodash/uniqueId";

import { Block } from "./block";
import { ExDrawBlock } from "../excalidraw/exDrawBlock";

const BLOCK_GROUP_WIDTH = 340;
const BLOCK_GROUP_PADDING_BOTTOM = 20;
const BLOCK_GROUP_PADDING_RIGHT = 20;
const BLOCK_HEIGHT = 100;

import {
  parseInputs,
  parseMutation,
  parseEditData,
} from "./blockParser";

export class FunctionBlock {
  constructor({node, signature = [], keysInScope, getCode, unfolded = false, groupId }={}) {
    this.node = node;
    this.nodes = node.body.body;
    this.signature = signature;
    this.keysInScope = keysInScope;
    this.getCode = getCode;
    this.unfolded = false;

    this.groupId = [_uniqueId("function-block-")];
    if (groupId) this.groupId.unshift(groupId);

    this.groupName = this.getGroupTitle();

    this.blocks = this.#parseBlocks(this.nodes, keysInScope);
    this.inputs = this.#parseInputs(this.nodes, keysInScope);
    this.outputs = this.#parseOutputs(this.nodes, keysInScope);
    this.editData = parseEditData(this.nodes);
    this.mutations = this.#parseMutations(this.nodes, keysInScope);
    this.controlFlowBlocks = [];

    this.exBlocks = [];
    this.drawBlock();
  }

  drawBackground() {
    this.backgroundBlock = new ExDrawBlock({
      title: this.groupName,
      inputs: this.unfolded ? this.inputs : _flattenDeep(this.inputs),
      outputs: this.unfolded ? this.outputs : _flattenDeep(this.outputs),
      groupId: this.groupId,
      isGroup: true,
      size: [
        this.getContentSize()[0] + BLOCK_GROUP_PADDING_RIGHT,
        this.getContentSize()[1] + BLOCK_GROUP_PADDING_BOTTOM
      ]
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
  getGroupId() {
    return this.backgroundBlock.groupId;
  }
  get() {
    return _flattenDeep([this.backgroundBlock.get(), this.blocks.map(block => block.get())]);
    // return _flattenDeep([this.backgroundBlock.get(), this.unfolded ? this.blocks.map(block => block.get()) : []]);
  }
  getNode() {
    return this.node;
  }
  getGroupTitle() {
    let [fname, ...args] = this.signature;
    return `Function ${fname} (${args.join(" ")})`;
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
  getEditData() {
    return this.editData.map(edit => Object.assign(
      {},
      edit,
      { id: this.getGroupId() }
      )
    );
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
  getEndPosition() {
    const [x, y] = this.backgroundBlock.getPosition();
    const [w, h] = this.backgroundBlock.getSize();
    return [x + w, y + h];
  }

  getContentSize() {
    return this.blocks.reduce((acc, block) => {
      const [w, h] = block.getSize();
      return [
        Math.max(acc[0], w),
        acc[1] + h + 10,
      ];
    }, [0, 0]);
  }
  getBreakReturnBlocks() {
    return []
  }

  /*
  ** 3. Boolean getter
  */

  /*
  ** 4. public setter
  */
  setLayoutNode(node) {
    this.layoutNode = node;
  }
  setPosition(x, y) {
    this.backgroundBlock.setPosition(x, y);
    const [offsetX, offsetY] = this.backgroundBlock.getContentOffset();
    this.blocks.forEach((block, index) => {
      if (index === 0) {
        block.setPosition(x + offsetX, y + offsetY + 5);
      } else {
        const [_x, _y] = this.blocks[index - 1].getEndPosition();
        block.setPosition(x + offsetX, _y + 10);
      }
    });
  }
  setIndex(index) {
    this.blocks.forEach(block => {
      index[block.groupId[block.groupId.length - 1]] = block;
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
  #parseBlocks(nodes, keysInScope) {
    return nodes.map((node, index) => {
      const groupId = this.groupId.concat([this.groupId + '_' + index]);
      return new Block({node, keysInScope, getCode: this.getCode, groupId});
    });
  }
  #parseInputs(nodes) {
    const inputs = new Set();
    nodes.map((node) => {
      const subInputs = parseInputs(node);
      subInputs.forEach(input => inputs.add(input));
    });
    return Array.from(inputs);
  }
  #parseOutputs(nodes, keysInScope) {
    let [fname, ...args] = this.signature;
    if (fname === 'constructor') return [];

    return [fname];
    // return nodes.map((node) => {
    //   return parseOutputs(node, keysInScope);
    // });
  }
  #parseMutations(nodes) {
    return nodes.map((node) => {
      return parseMutation(node);
    });
  }
}
