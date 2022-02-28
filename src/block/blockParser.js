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
import _flatten from "lodash/flatten";

const identifierMap = {
  BinaryExpression: ["left", "right"],
  AssignmentExpression: ["left", "right"],
  CallExpression: ["callee", "arguments"],
  BlockStatement: ["body"],
  ReturnStatement: ["argument"],
  ObjectExpression: ["properties"],
  Property: ["value"],
  CallExpression: ["callee", "arguments"],
  MemberExpression: ["object"],
};

const identifierNameMap = {
  ExpressionStatement: "Statement",
  FunctionDeclaration: "Function",
  VariableDeclaration: "Variable",
  IfStatement: "if",
  WhileStatement: "while",
  DoWhileStatement: "do-while",
  BreakStatement: "break",
  ContinueStatement: "continue",
  ImportDeclaration: "Import",
  ExportNamedDeclaration: "Export",
  ClassDeclaration: "Class",
};

export const parseTitle = (node, getCode) => {
  let prefix = '';
  if (node.type === 'ExportNamedDeclaration') {
    prefix = 'export ';
  }

  if (node.type === 'ExportNamedDeclaration' && node.declaration) {
    node = node.declaration;
  }

  let title = node.type;
  const codeInTitle = parseSubtitle(node, getCode);

  title = identifierNameMap[node.type];
  if (node.type === "ExpressionStatement") {
    const expressionStatementMap = {
      AssignmentExpression: "Assignment",
      CallExpression: "Call",
    };
    title = expressionStatementMap[node.expression.type];
  }
  if (node.type === "ReturnStatement") {
    title = "Return";
  }

  return prefix + title + (codeInTitle ? ` (${codeInTitle})` : "");
}

export const parseContent = (node, getCode) => {
  return astHandler(node, {
    'ImportDeclaration': (node) => {
      return node.specifiers.map(specifier => {
        return `${specifier.imported.name}`;
      }).join('\n');
    },
    'ExportNamedDeclaration': (node) => {
      return parseContent(node.declaration, getCode);
    },
    'ClassDeclaration': (node) => {
      return node.id.name;
    },
    'ExpressionStatement': {
      'expression': {
        // 'AssignmentExpression': (node) => {
        //   let expression = getCode(node);
        //   return formatCode(expression).slice(0, 18);
        // }
      }
    }
  })
}

export const parseSubtitle = (node, getCode) => {
  return astHandler(node, {
    'ImportDeclaration': (node) => {
      return getCode(node.source);
    },
    'IfStatement': (node) => {
      return getCode(node.test);
    },
    'WhileStatement': (node) => {
      return getCode(node.test);
    },
    'DoWhileStatement': (node) => {
      return getCode(node.test);
    },
    'ReturnStatement': (node) => {
      return getCode(node.argument);
    },
    'ExpressionStatement': {
      'expression': {
        'AssignmentExpression': (node) => {
          return getCode(node.left)
        },
        'CallExpression': (node) => {
          return node.callee.name;
        }
      }
    }
  });
};

const parseBlockStatement = (blockStatement) => {
  return blockStatement.body; // list of BlockStatement
};

const parseStatementInputs = (statement) => {
  return parseIdentifiers(statement);
};

const parseExpressionInputs = (expression) => {
  // primamry expression
  // lhs expressoin
  //  - call expression
  // update expression
  // unary expression
  // assignment expression
  switch (expression.type) {
    case "CallExpression":
      const closureInputs = [];
      const argumentInputs = parseIdentifiers(expression.arguments);
      return closureInputs.concat(argumentInputs);
    case "AssignmentExpression":
      return parseIdentifiers(expression.right);
      return [];
    default:
      return [];
  }
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
  let res = []
  switch (node.type) {
    case "VariableDeclaration":
      res = [];
      break;
    case "ExpressionStatement":
      res = parseExpressionInputs(node.expression);
      break;
    case "ObjectExpression":
      res = _flatten(node.properties.map((prop) => parseInputs(prop.value)));
      break;
    case "IfStatement":
      res = parseStatementInputs(node.test);
      break;
    case "WhileStatement":
      res = parseStatementInputs(node.test);
      break;
    case "FunctionDeclaration":
      const params = parseIdentifiers(node.params);
      res = parseIdentifiers(node.body).filter((id) => !params.includes(id));
      break;
    default:
      res = [];
  }
  res = excludeBuiltin(new Set(res));
  return Array.from(res);
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
    case "DoWhileStatement":
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
    case 'ReturnStatement':
      return [node.argument].filter(e => e).map(getCode);
    case "ExpressionStatement":
      if (node.expression?.type === "AssignmentExpression") {
        return [node.expression].filter(e => e).map(getCode);
      } else if (node.expression?.type === "CallExpression") {
        return [node.expression.callee.name];
      }
    default:
      return "";
  }
};

const parseLeftValue = (node) => {
  return astHandler(node, {
    'MemberExpression': (node) => {
      return node.object.type === 'ThisExpression' ? {
        name: 'left',
        value: 'this' + '.' + node.property.name,
        path: 'property.name'
      } : {
        name: 'left',
        value: node.object.name + '.' + node.property.name,
        path: 'object.name'
      }
    },
    'Identifier': (node) => {
      return {
        name: 'left',
        value: node.name,
        path: 'name'
      }
    }
  })
}

const parseRightValue = (node) => {
  return astHandler(node, {
    'Identifier': (node) => {
      return {
        name: 'right',
        value: node.name,
        path: 'name'
      }
    },
    'NullLiteral': (node) => {
      return {
        name: 'right',
        value: 'null',
        path: 'type'
      };
    },
    'ArrayExpression': (node) => {
      return {
        name: 'right',
        value: node.elements.map(e => e.value).join(','),
        path: 'elements'
      }
    },
    'MemberExpression': (node) => {
      return {
        name: 'right',
        value: node.object.name + '.' + node.property.name,
        path: 'object.name'
      }
    },
    'CallExpression': (node) => {
      return {
        name: 'right',
        value: node.callee.name,
        path: 'callee.name',
      }
    }
  })
}

export const parseEditData = (node) => {
  return astHandler(node, {
    'ImportDeclaration': (node) => {
      return node.specifiers.map((spec, index) => {
        return {
          name: 'import',
          value: spec.imported.name,
          path: `specifiers.${index}.imported.name`,
        }
      }).concat([{
        name: 'source',
        value: node.source.value,
        path: 'source.value',
      }]);
    },
    'ExpressionStatement': {
      'expression': {
        'AssignmentExpression': (node) => {
          return [parseLeftValue(node.left), parseRightValue(node.right)];
        }
      }
    },
    'VariableDeclaration': (node) => {
      return node.declarations.map((dec, index) => {
        if (dec.init && dec.init.type === "NumericLiteral") {
          return {
            name: dec.id.name,
            value: dec.init.value,
            path: `declarations.${index}.init.value`
          }
        } else {
          return null;
        }
      }).filter(e => e);
    },
  }) || [];
}

export const formatCode = (code) => {
  return code.replace(/\n/g, " ").replace(/\s+/g, " ");
}

export const setNode = (node, path, value) => {
  const keys = path.split('.');
  let n = node;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!n[keys[i]]) {
      return null;
    }
    n = n[keys[i]];
  }
  const type = typeof n[keys[keys.length - 1]]
  n[keys[keys.length - 1]] = type === 'number' ? parseInt(value) : value;
  return node;
}

/*
** ========== private ==========
*/

const excludeBuiltin = (keywordSet) => {
  ['Math', 'Infinity', 'NaN', 'undefined', 'null', 'true', 'false'].forEach(keyword => {
    keywordSet.delete(keyword);
  });
  return keywordSet;
}

const astHandler = (node, handlerMap) => {
  const _handler = (_node, _handlerMap) => {
    if (!(_node.type in _handlerMap)) {
      return null;
    }
    const maybeHandler = _handlerMap[_node.type];
    if (typeof maybeHandler === 'function') {
      return maybeHandler(_node);
    } else if (typeof maybeHandler === 'object') {
      for (let path in maybeHandler) {
        const innerNode = _node[path];
        const innerMap = maybeHandler[path];
        if (innerNode.type in innerMap) {
          return _handler(innerNode, innerMap);
        }
      }
    }
    return null;
  };
  return _handler(node, handlerMap);
};
