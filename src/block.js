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
  formatCode,
} from "./blockParser";

/* Block is the AST representation that manages UI elements */
export class Block {
  constructor({ node, keysInScope, getCode, groupId } = {}) {
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
    // this.blockType = parseBlockType(node, getCode);
    this.sourceCode = parseSourceCode(node, getCode);
    this.title = this.title();
    this.content = this.content();

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
      title: this.title,
      inputs: this.inputs,
      outputs: this.outputs,
      content: this.content,
      controlFlows: Object.keys(this.controlFlows),
      groupId: this.groupId,
      isControlFlow: this.isControlFlowBlock(),
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
      BreakStatement: "break",
      ContinueStatement: "continue",
    };
    const expressionStatementMap = {
      AssignmentExpression: "Assignment",
    };
    title = identifierNameMap[this.name];
    if (this.name === "ExpressionStatement") {
      title = expressionStatementMap[this.node.expression.type];
    }
    if (this.name === "ReturnStatement") {
      title = "Return";
    }

    return title + (codeInTitle ? ` (${codeInTitle.slice(0, 10)})` : "");
  }
  content() {
    if (this.name === 'ExpressionStatement' && this.node.expression?.type === 'AssignmentExpression') {
      let [expression] = this.sourceCode
      return formatCode(expression).slice(0, 18);
    }
    return '';
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
  // Boolean getter
  isControlFlowBlock() {
    return ["BreakStatement", "ContinueStatement"].includes(this.name);
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
