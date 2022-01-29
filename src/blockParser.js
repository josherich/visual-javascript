import { getCode } from "./exampleAST";

const identifierMap = {
  BinaryExpression: ["left", "right"],
  AssignmentExpression: ["left", "right"],
  CallExpression: ["callee", "arguments"],
  BlockStatement: ["body"],
  ReturnStatement: ["argument"],
};

const identifierNameMap = {
  ExpressionStatement: "statement",
  FunctionDeclaration: "function",
  VariableDeclaration: "variable",
  IfStatement: "if",
};

const parseBlockStatement = (blockStatement) => {
  return blockStatement.body; // list of BlockStatement
};

const parseExpression = (expression) => {
  return parseIdentifiers(expression);
};

const parseIdentifiers = (expression) => {
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
};

const parseVarDeclarations = (declarations) => {
  return declarations.map((d) => d.id.name);
};

// ======================= public =======================

export const parseInputs = (node) => {
  switch (node.type) {
    case "VariableDeclaration":
      return [];
    case "ExpressionStatement":
      return parseIdentifiers(node.expression.right);
    case "IfStatement":
      return parseExpression(node.test);
    case "FunctionDeclaration":
      const params = parseIdentifiers(node.params);
      return parseIdentifiers(node.body).filter((id) => !params.includes(id));
    default:
      return [];
  }
};

// keys in scope can tell assignment and gloabal declaration
export const parseOutputs = (node, keysInScope) => {
  switch (node.type) {
    case "VariableDeclaration":
      return parseVarDeclarations(node.declarations);
    case "FunctionDeclaration":
      return [node.id.name];
    case "ExpressionStatement":
      return parseOutputs(node.expression, keysInScope);
    case "AssignmentExpression":
      if (
        node.left.type === "Identifier" &&
        !keysInScope.includes(node.left.name)
      ) {
        return parseIdentifiers(node.left); // only when id exists in refs
      } else {
        return [];
      }
    default:
      return [];
  }
};

export const parseMutation = (node) => {
  if (
    node.type === "ExpressionStatement" &&
    node.expression.type === "AssignmentExpression"
  ) {
    return [node.expression.left.name, node.expression.right.value];
  } else {
    return null;
  }
};

export const parseControlFlows = (node) => {
  switch (node.type) {
    case "IfStatement":
      return {
        True: parseBlockStatement(node.consequent),
        False: parseBlockStatement(node.alternate),
      };
    default:
      return {};
  }
};

export const parseBlockType = (node) => {
  switch (node.type) {
    case "ExpressionStatement":
      if (
        node.expression.type === "AssignmentExpression" &&
        node.expression.right.type === "BinaryExpression"
      ) {
        return node.expression.right.operator;
      }
      if (node.expression.type === "AssignmentExpression") {
        return getCode(node.expression);
      }
      return "";
    default:
      return "";
  }
};

export const parseSourceCode = (node) => {
  switch (node.type) {
    case "IfStatement":
      return [node.test, node.consequent, node.alternate].map(getCode);
    default:
      return "";
  }
};

export const getCodeInTitle = (name, sourceCode) => {
  switch (name) {
    case "IfStatement":
      return sourceCode[0];
    default:
      return "";
  }
};
