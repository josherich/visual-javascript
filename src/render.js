import { exampleAST, source } from "./exampleAST";
import { BlockManager } from "./blockManager";

// ===================================================================
let actions = {};
const registerAction = (name, action) => {
  actions[name] = action;
};

// ===================================================================

const render = (statements, source) => {
  const manager = new BlockManager(statements, source);
  return manager.getExDrawElements();
};

const start = () => {
  const statements = exampleAST["body"];
  return render(statements, source);
};
// ====================================================================
export const exBlocks = start();
