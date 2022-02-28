import { ExDrawBlock } from "../excalidraw/exDrawBlock";
import { ExDrawArrow } from "../excalidraw/exDrawArrow";
import { BlockGroup } from "./blockGroup";
import { FunctionBlock } from "./functionBlock";

import {
  parseInputs,
  parseOutputs,
  parseMutation,
  parseControlFlows,
  parseSourceCode,
  parseEditData,
  parseTitle,
  parseContent,
  setNode,
} from "./blockParser";

/* Block is the AST representation that manages UI elements */
export class Block {
  constructor({ node, keysInScope, getCode, groupId } = {}) {
    this.name = node.type;
    this.keysInScope = keysInScope;
    this.getCode = getCode;
    this.groupId = groupId;
    this.node = node;

    this.inputs = parseInputs(node); // var deps
    this.outputs = parseOutputs(node, keysInScope); // if var declaration
    this.mutation = parseMutation(node);
    this.controlFlows = parseControlFlows(node); // control flow statement
    this.sourceCode = parseSourceCode(node, getCode);
    this.editData = parseEditData(node);

    this.title = parseTitle(node, getCode);
    this.content = parseContent(node, getCode);

    this.mini = false;
    this.prev = null;
    this.next = null;
    this.position = null;
    this.exBlock = null;
    this.controlFlowBlocks = [];
    this.classMethodBlocks = [];
    this.layoutNode = null;
    this.links = [];

    this.drawBlock();
  }

  drawBlock() {
    this.exBlock = new ExDrawBlock({
      title: this.title,
      inputs: this.inputs,
      outputs: this.outputs,
      content: this.content,
      controlFlows: Object.keys(this.controlFlows),
      groupId: this.groupId,
      isControlFlow: this.isControlFlowBlock(),
    });

    this.drawControlFlow();
    this.drawClassMethods();
  }

  drawControlFlow() {
    this.controlFlowBlocks = Object.entries(this.controlFlows)
      .map(([name, statements]) => {
        if (name === "Exit") {
          return null;
        } else {
          return new BlockGroup({
            nodes: statements,
            keysInScope: this.keysInScope,
            getCode: this.getCode,
          });
        }
      })
      .filter((e) => e);
    this.linkControlFlow();
  }

  drawClassMethods() {
    if (!(this.node.type === "ClassDeclaration" || this.node.declaration?.type === "ClassDeclaration")) return;

    this.classMethodBlocks = this.node.declaration.body.body.map(method => {
      const methodName = method.kind === "constructor" ? "constructor" : method.key.name;
      return new FunctionBlock({
        node: method,
        keysInScope: this.keysInScope,
        getCode: this.getCode,
        signature: [methodName, method.params.map(p => p.name)],
        groupId: this.groupId,
      });
    });
  }

  /*
  ** 1. public get
  */
  id() {
    return this.exBlock.id();
  }
  linkId() {
    return this.exBlock.linkId();
  }
  get() {
    return [
      this.exBlock.get(),
      ...this.controlFlowBlocks.map((block) => block.get()),
      ...this.classMethodBlocks.map((block) => block.get()),
      ...this.links.map((link) => link.get()),
    ];
  }
  findBlockById(id) {
    return this.classMethodBlocks.find(block => block.id() === id);
  }
  getGroupId() {
    return this.exBlock.groupId;
  }
  getNode() {
    return this.node;
  }

  getInputs() {
    return this.inputs;
  }
  getOutputs() {
    return this.outputs;
  }
  getMutations() {
    return [this.mutation];
  }
  getEditData() {
    return this.editData.map(edit => Object.assign(
      {},
      edit,
      { id: this.getGroupId() }
      )
    );
  }
  getBreakReturnBlocks() {
    const jumpBlocks = [];
    const recursivelyFindBreakReturnBlocks = (block) => {
      if (block instanceof BlockGroup) {
        block.blocks.forEach((block) =>
          recursivelyFindBreakReturnBlocks(block)
        );
      } else if (block instanceof Block) {
        if (
          ["WhileStatement", "DoWhileStatement", "ForStatement"].includes(
            block.name
          )
        )
          return;
        if (["BreakStatement"].includes(block.name)) {
          return jumpBlocks.push(block);
        }
        block.controlFlowBlocks.forEach((block) =>
          recursivelyFindBreakReturnBlocks(block)
        );
      }
    };
    this.controlFlowBlocks.forEach((block) =>
      recursivelyFindBreakReturnBlocks(block)
    );
    return jumpBlocks;
  }

  /*
  ** 2. UI getter
  */
  getInputPosition(index) {
    return this.exBlock.getInputPosition(index);
  }
  getOutputPosition(index) {
    return this.exBlock.getOutputPosition(index);
  }
  getMutationPosition() {
    return this.exBlock.getMutationPosition();
  }
  getControlFlowInPosition() {
    return this.exBlock.getControlFlowInPosition();
  }
  getControlFlowOutPosition(index) {
    return this.exBlock.getControlFlowOutPosition(index);
  }
  getPosition() {
    return this.exBlock.getPosition();
  }
  getSize() {
    return this.exBlock.getSize();
  }
  getEndPosition() {
    const [x, y] = this.getPosition();
    const [width, height] = this.getSize();
    return [x + width, y + height];
  }

  /*
  ** 3. Boolean getter
  */
  isControlFlowBlock() {
    return ["BreakStatement", "ContinueStatement"].includes(this.name);
  }

  /*
  ** 4. public setter
  */
  edit(path, value) {
    setNode(this.node, path, value);
  }
  setLayoutNode(node) {
    this.layoutNode = node;
  }
  setPosition(x, y) {
    const [w, h] = this.getSize();
    this.exBlock.setPosition(x, y);
    this.controlFlowBlocks.forEach((block, index) => {
      if (index === 0) {
        block.setPosition(x + w + 40, y - 0);
      } else {
        block.setPosition(x + w + 40, y - 0 + this.controlFlowBlocks[index - 1].getSize()[1] + 40);
      }
    });
    this.classMethodBlocks.forEach((block, index) => {
      if (index === 0) {
        block.setPosition(x, y + this.exBlock.getSize()[1] + 20);
      } else {
        const prev = this.classMethodBlocks[index - 1];
        block.setPosition(x, prev.getEndPosition()[1] + 20);
      }
    });
    this.links.forEach((link, index) => {
      const block = this.controlFlowBlocks[index];
      link.setPosition(
        ...this.getControlFlowOutPosition(index),
        ...block.getControlFlowInPosition()
      );
    });
  }
  setIndex(index) {
    this.classMethodBlocks.forEach(block => {
      index[block.groupId[block.groupId.length - 1]] = block;
      block.setIndex(index);
    });
  }
  followPosition(block, transformer) {
    const pos = transformer(...block.getPosition());
    this.setPosition(...pos);
  }
  linkControlFlow() {
    this.links = this.controlFlowBlocks.map((block, index) => {
      const link = new ExDrawArrow({
        startElement: this.linkId(),
        endElement: block.linkId(),
        startPosition: this.getControlFlowOutPosition(index),
        endPosition: block.getControlFlowInPosition(),
      });
      this.link(link);
      block.link(link);
      return link;
    });
  }
  link(arrow) {
    this.exBlock.link(arrow);
  }
}
