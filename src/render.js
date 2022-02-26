import { exampleAST, source } from "./exampleAST";
import { BlockManager } from "./block/blockManager";
import { parse } from "@babel/parser";

// ===================================================================
let actions = {};
const registerAction = (name, action) => {
  actions[name] = action;
};

// ===================================================================
export let manager = {};
export const exampleSource = source;

const start = () => {
  const statements = exampleAST['program']["body"];
  manager = new BlockManager(statements, source);
};

export const reload = (source) => {
  const ast = parse(source, { ecmaVersion: 2020 });
  manager = new BlockManager(ast['program']["body"], source);
}

export const codeGen = () => {
  return manager.generate()?.code;
}
// ====================================================================
start();

