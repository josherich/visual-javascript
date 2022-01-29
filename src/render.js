import { exampleAST } from "./exampleAST";
import { BlockManager } from "./blockManager";

// ===================================================================
let actions = {};
const registerAction = (name, action) => {
  actions[name] = action;
};

// ===================================================================

const render = (statements) => {
  const manager = new BlockManager(statements);
  return manager.getExDrawElements();
};

const start = () => {
  const statements = exampleAST["body"];
  return render(statements);
};
// ====================================================================
export const exBlocks = start();
