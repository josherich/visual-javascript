import { ExDrawBlock } from "./exDrawBlock";
import { ExDrawArrow } from "./exDrawArrow";
// var a = 42;
// var b = 5;
// function addA(d) {
//   return a + d;
// }
// c = addA(2) + b;
// if (c + b > 0) {
//   a = 0;
// } else {
//   a = 1;
// }
const identifierMap = {
  BinaryExpression: ["left", "right"],
  CallExpression: ["callee", "arguments"],
  BlockStatement: ["body"],
  ReturnStatement: ["argument"]
};

const identifierNameMap = {
  ExpressionStatement: "statement",
  FunctionDeclaration: "function",
  VariableDeclaration: "variable",
  IfStatement: "if",
};

/* Block is the AST representation that manages UI elements */
export class Block {
  constructor(node) {
    // ast node
    this.name = node.type;
    this.inputs = this.parseInputs(node); // var deps
    this.outputs = this.parseOutputs(node); // if var declaration
    this.controlFlows = this.parseControlFlows(node); // control flow statement
    this.blockType = this.parseBlockType(node);
    this.sourceCode = this.parseSourceCode(node);
    this.prev = null;
    this.next = null;
    this.position = null;
    this.exBlock = null;
    this.links = [];

    this.drawBlock();
  }
  parseBlockType(node) {
    switch(node.type) {
      case "ExpressionStatement":
        if (node.expression.type === "AssignmentExpression") {
          return node.expression.right.operator;
        }
        return "";
      default:
        return "";
    }
  }
  parseSourceCode(node) {
    switch(node.type) {
      case "IfStatement":
        return [node.test.code, node.consequent.code, node.alternate.code];
      default:
        return '';
    }
  }
  parseInputs(node) {
    switch(node.type) {
      case "VariableDeclaration":
        return [];
      case "ExpressionStatement":
        return this.parseIdentifiers(node.expression.right);
      case "IfStatement":
        return this.parseExpression(node.test);
      case "FunctionDeclaration":
        const params = this.parseIdentifiers(node.params);
        return this.parseIdentifiers(node.body).filter(
          (id) => !params.includes(id)
        );
      default:
        return [];
    }
  }
  parseOutputs(node) {
    switch(node.type) {
      case "VariableDeclaration":
        return this.parseVarDeclarations(node.declarations);
      case "FunctionDeclaration":
        return [node.id.name];
      case "ExpressionStatement":
        return this.parseIdentifiers(node.expression.left);
      default:
        return [];
    }
  }
  parseControlFlows(node) {
    switch(node.type) {
      case "IfStatement":
        return {
          True: this.parseBlockStatement(node.consequent),
          False: this.parseBlockStatement(node.alternate),
        }
      default:
        return [];
    }
  }
  parseBlockStatement(blockStatement) {
    return blockStatement.body; // list of BlockStatement
  }
  parseExpression(expression) {
    return this.parseIdentifiers(expression);
  }
  parseIdentifiers(expression) {
    function _parseID(expression, ids) {
      if (Array.isArray(expression)) {
        expression.forEach((exp) => _parseID(exp, ids));
      } else if (expression.type !== "Identifier") {
        const childKeys = identifierMap[expression.type] || [];
        childKeys.forEach((key) => {
          _parseID(expression[key], ids);
        });
      } else {
        ids.push(expression.name);
      }
      return ids;
    }
    return _parseID(expression, []);
  }
  parseVarDeclarations(declarations) {
    return declarations.map((d) => d.id.name);
  }
  drawBlock() {
    // draw block in position(x,y)
    this.exBlock = new ExDrawBlock({
      title: this.title(),
      inputs: this.inputs,
      outputs: this.outputs,
      controlFlows: Object.keys(this.controlFlows),
    });
    this.exControlFlowBlocks = Object.entries(this.controlFlows).map(([name, statements]) => {
      return new ExDrawBlock({
        title: "statments",
        inputs: [],
        outputs: [],
      });
    });
    this.linkControlFlow();
  }
  id() {
    return this.exBlock.id();
  }
  get() {
    console.log(this.links.map(link => link.get()))
    return [this.exBlock.get(), ...this.exControlFlowBlocks.map((block) => block.get()), ...this.links.map(link => link.get())];
  }
  getCodeInTitle() {
    switch(this.name) {
      case "IfStatement":
        return this.sourceCode[0];
      default:
        return "";
    }
  }
  title() {
    return `${identifierNameMap[this.name] || this.name} ${this.blockType}` + (this.getCodeInTitle() ? `(${this.getCodeInTitle()})` : "");
  }
  getInputPosition(index) {
    return this.exBlock.getInputPosition(index);
  }
  getOutputPosition(index) {
    return this.exBlock.getOutputPosition(index);
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
  setPosition(x, y) {
    this.exBlock.setPosition(x, y);
    this.exControlFlowBlocks.forEach((block, index) => {
      block.setPosition(x + 170, y + (index + 1) * 110);
    });
    this.links.forEach((link, index) => {
      const block = this.exControlFlowBlocks[index];
      link.setPosition(...this.getControlFlowOutPosition(index), ...block.getControlFlowInPosition())
    })
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
