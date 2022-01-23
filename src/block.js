import { ExDrawBlock } from "./exDrawBlock";
// var a = 42;
// var b = 5;
// function addA(d) {
//   return a + d;
// }
// c = addA(2) + b;
const identifierMap = {
  BinaryExpression: ["left", "right"],
  CallExpression: ["callee", "arguments"],
  BlockStatement: ["body"],
  ReturnStatement: ["argument"]
};

export class Block {
  constructor(node) {
    // ast node
    this.name = node.type;
    this.inputs = this.parseInputs(node); // var deps
    this.outputs = this.parseOutputs(node); // if var declaration
    this.prev = null;
    this.next = null;
    this.position = null;
    this.exBlock = null;

    this.drawBlock();
  }
  parseInputs(node) {
    if (node.type === "VariableDeclaration") {
      return [];
    } else if (node.type === "ExpressionStatement") {
      return this.parseIdentifiers(node.expression.right);
    } else if (node.type === "FunctionDeclaration") {
      const params = this.parseIdentifiers(node.params);
      return this.parseIdentifiers(node.body).filter(
        (id) => !params.includes(id)
      );
    }
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
  parseOutputs(node) {
    if (node.type === "VariableDeclaration") {
      return this.parseDeclarations(node.declarations);
    } else if (node.type === "FunctionDeclaration") {
      return [node.id.name];
    } else if (node.type === "ExpressionStatement") {
      return this.parseIdentifiers(node.expression.left);
    }
    return [];
  }
  parseDeclarations(declarations) {
    return declarations.map((d) => d.id.name);
  }
  drawBlock() {
    // draw block in position(x,y)
    this.exBlock = new ExDrawBlock({
      title: this.name,
      inputs: this.inputs,
      outputs: this.outputs
    });
  }
  id() {
    return this.exBlock.id();
  }
  getInputPosition(index) {
    return this.exBlock.getInputPosition(index);
  }
  getOutputPosition(index) {
    return this.exBlock.getOutputPosition(index);
  }
  getPosition() {
    return this.exBlock.getPosition();
  }
  setPosition(x, y) {
    this.exBlock.setPosition(x, y);
  }
  followPosition(block, transformer) {
    const pos = transformer(...block.getPosition());
    this.exBlock.setPosition(...pos);
  }
  link(arrow) {
    this.exBlock.link(arrow);
  }
}
