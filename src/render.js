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

export const reload = (source, textMode = false) => {
  const ast = parse(source, { ecmaVersion: 2020, sourceType: "module" });
  manager = new BlockManager(ast['program']["body"], source, textMode);
}

export const codeGen = () => {
  return manager.generate()?.code;
}
// ====================================================================
start();

