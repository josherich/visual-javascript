import { ExDrawBlock } from "./exDrawBlock";
import { ExDrawArrow } from "./exDrawArrow";
import { getCode } from "./exampleAST";

import {
  parseInputs,
  parseOutputs,
  parseMutation,
  parseControlFlows,
  parseBlockType,
  parseSourceCode,
  getCodeInTitle,
} from "./blockParser";

/* Block is the AST representation that manages UI elements */
export class Block {
  constructor(node, keysInScope) {
    // ast node
    this.name = node.type;
    this.keysInScope = keysInScope;

    this.inputs = parseInputs(node); // var deps
    this.outputs = parseOutputs(node, keysInScope); // if var declaration
    this.mutation = parseMutation(node);
    this.controlFlows = parseControlFlows(node); // control flow statement
    this.blockType = parseBlockType(node);
    this.sourceCode = parseSourceCode(node);

    this.prev = null;
    this.next = null;
    this.position = null;
    this.exBlock = null;
    this.exControlFlowBlocks = null;
    this.layoutNode = null;
    this.links = [];

    this.drawBlock();
  }

  drawBlock() {
    // draw block in position(x,y)
    this.exBlock = new ExDrawBlock({
      title: this.title(),
      inputs: this.inputs,
      outputs: this.outputs,
      controlFlows: Object.keys(this.controlFlows),
    });
    this.exControlFlowBlocks = Object.entries(this.controlFlows).map(
      ([name, statements]) => {
        return new ExDrawBlock({
          title: "statments",
          content: statements.map(getCode).join("\n"),
          inputs: [],
          outputs: [],
        });
      }
    );
    // this.exControlFlowBlocks = Object.entries(this.controlFlows).map(([name, statements]) => {
    //   return new BlockGroup({
    //     nodes: statements,
    //     keysInScope: this.keysInScope,
    //   });
    // });
    this.linkControlFlow();
  }

  // getter
  id() {
    return this.exBlock.id();
  }
  get() {
    return [
      this.exBlock.get(),
      ...this.exControlFlowBlocks.map((block) => block.get()),
      ...this.links.map((link) => link.get()),
    ];
  }

  title() {
    const codeInTitle = getCodeInTitle(this.name, this.sourceCode);
    const identifierNameMap = {
      ExpressionStatement: "statement",
      FunctionDeclaration: "function",
      VariableDeclaration: "variable",
      IfStatement: "if",
    };
    return (
      `${identifierNameMap[this.name] || this.name} ${this.blockType}` +
      (codeInTitle ? `(${codeInTitle})` : "")
    );
  }
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

  // setter
  setLayoutNode(node) {
    this.layoutNode = node;
  }
  setPosition(x, y) {
    this.exBlock.setPosition(x, y);
    this.exControlFlowBlocks.forEach((block, index) => {
      block.setPosition(x + 170, y + (index + 1) * 110);
    });
    this.links.forEach((link, index) => {
      const block = this.exControlFlowBlocks[index];
      link.setPosition(
        ...this.getControlFlowOutPosition(index),
        ...block.getControlFlowInPosition()
      );
    });
  }
  followPosition(block, transformer) {
    const pos = transformer(...block.getPosition());
    this.setPosition(...pos);
  }
  linkControlFlow() {
    this.links = this.exControlFlowBlocks.map((block, index) => {
      const link = new ExDrawArrow({
        startElement: this.id(),
        endElement: block.id(),
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
