import { ExDrawBlock } from "./exDrawBlock";
import { ExDrawArrow } from "./exDrawArrow";
import { BlockGroup } from "./blockGroup";

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
  constructor({node, keysInScope, getCode, groupId}={}) {
    // ast node
    this.name = node.type;
    this.keysInScope = keysInScope;
    this.getCode = getCode;
    this.groupId = groupId;
    this.node = node;

    this.inputs = parseInputs(node); // var deps
    this.outputs = parseOutputs(node, keysInScope); // if var declaration
    this.mutation = parseMutation(node);
    this.controlFlows = parseControlFlows(node); // control flow statement
    this.blockType = parseBlockType(node, getCode);
    this.sourceCode = parseSourceCode(node, getCode);

    this.prev = null;
    this.next = null;
    this.position = null;
    this.exBlock = null;
    this.controlFlowBlocks = null;
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
      groupId: this.groupId,
    });
    // this.controlFlowBlocks = Object.entries(this.controlFlows).map(
    //   ([name, statements]) => {
    //     return new ExDrawBlock({
    //       title: "statments",
    //       content: statements.map(this.getCode).join("\n"),
    //       inputs: [],
    //       outputs: [],
    //     });
    //   }
    // );
    this.controlFlowBlocks = Object.entries(this.controlFlows).map(
      ([name, statements]) => {
        return new BlockGroup({
          nodes: statements,
          keysInScope: this.keysInScope,
          getCode: this.getCode,
        });
    });
    this.linkControlFlow();
  }

  // getter
  id() {
    return this.exBlock.id();
  }
  get() {
    return [
      this.exBlock.get(),
      ...this.controlFlowBlocks.map((block) => block.get()),
      ...this.links.map((link) => link.get()),
    ];
  }

  title() {
    let title = this.name;
    const codeInTitle = getCodeInTitle(this.name, this.sourceCode);
    const identifierNameMap = {
      FunctionDeclaration: "Function",
      VariableDeclaration: "Variable",
      IfStatement: "if",
      WhileStatement: "while",
      DoWhileStatement: "do-while",
    };
    const expressionStatementMap = {
      AssignmentExpression: "Assignment",
    }
    title = identifierNameMap[this.name];
    if (this.name === 'ExpressionStatement') {
      title = expressionStatementMap[this.node.expression.type];
    }
    if (this.blockType) {
      title += ` ${this.blockType}`;
    }
    return (
      title +
      (codeInTitle ? ` (${codeInTitle})` : "")
    );
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
    this.controlFlowBlocks.forEach((block, index) => {
      block.setPosition(x + 170, y - 400 + (index + 1) * 300);
    });
    this.links.forEach((link, index) => {
      const block = this.controlFlowBlocks[index];
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
    this.links = this.controlFlowBlocks.map((block, index) => {
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
