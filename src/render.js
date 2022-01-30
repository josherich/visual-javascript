import { exampleAST, source } from "./exampleAST";
import { BlockManager } from "./blockManager";
const acorn = require("acorn");

// ===================================================================
let actions = {};
const registerAction = (name, action) => {
  actions[name] = action;
};

// ===================================================================
export let manager = {};
export const exampleSource = source;

const start = () => {
  const statements = exampleAST["body"];
  manager = new BlockManager(statements, source);
};

export const reload = (source) => {
  const ast = acorn.parse(source, { ecmaVersion: 2020 });
  manager = new BlockManager(ast["body"], source);
}
// ====================================================================
start();

