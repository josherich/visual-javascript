// ======== supported =========
// VariableDeclaration
// FunctionDeclaration
// IfStatement
// AssignmentExpression

// ========== todo ===========
// WhileStatement, doWhileStatement
// ForStatement, for in, for of
// break
// return
// continue
// try catch finally throw
// SwitchStatement
// ConditionalOperator
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
    case "WhileStatement":
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
      let res = {
        True: parseBlockStatement(node.consequent),
      };
      if (node.alternate) {
        res.False = parseBlockStatement(node.alternate);
      }
      return res;
    case "WhileStatement":
      return {
        Body: parseBlockStatement(node.body),
      };
    case "BreakStatement":
      return {
        Exit: [],
      }
    case "ContinueStatement":
      return {
        Exit: [],
      }
    default:
      return {};
  }
};

export const parseBlockType = (node, getCode) => {
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

export const parseSourceCode = (node, getCode) => {
  switch (node.type) {
    case "IfStatement":
      return [node.test, node.consequent, node.alternate].filter(e => e).map(getCode);
    case "WhileStatement":
      return [node.test, node.body].filter(e => e).map(getCode);
    case "DoWhileStatement":
      return [node.body, node.test].filter(e => e).map(getCode);
    default:
      return "";
  }
};

export const getCodeInTitle = (name, sourceCode) => {
  switch (name) {
    case "IfStatement": {
      let [test, consequent, alternate] = sourceCode;
      return test;
    }
    case "WhileStatement": {
      let [test, body] = sourceCode;
      return test;
    }
    case "DoWhileStatement": {
      let [body, test] = sourceCode;
      return test;
    }
    default:
      return "";
  }
};
