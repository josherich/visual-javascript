import { BlockManager } from "../src/blockManager";
const acorn = require("acorn");

export const runBlockTest = (testName, source, expectBlocks) => {
  const exampleAST = acorn.parse(source, { ecmaVersion: 2020 });
  const statements = exampleAST['body'];
  const manager = new BlockManager(statements);
  const actualBlocks = manager.blocks;

  console.assert(
    actualBlocks.length === expectBlocks.length,
    `Expected ${expectBlocks.length} blocks, but got ${actualBlocks.length}`
  );
  actualBlocks.forEach((actual, index) => {
    console.assert(
      actual.inputs.sort().toString() === expectBlocks[index].inputs.sort().toString(),
      `${testName} : block No.${index+1} inputs : actual (${actual.inputs}), expect (${expectBlocks[index].inputs})`
    );
    console.assert(
      actual.outputs.sort().toString() === expectBlocks[index].outputs.sort().toString(),
      `${testName} : block No.${index+1} outputs: actual (${actual.outputs}), expect (${expectBlocks[index].outputs})`
    );
    console.assert(
      Object.keys(actual.controlFlows).sort().toString() === Object.keys(expectBlocks[index].controlFlows||{}).sort().toString(),
      `${testName} : block No.${index+1} control flow: actual (${Object.keys(actual.controlFlows)}), expect (${expectBlocks[index].controlFlows})`
    );
  });

};

export const runBlockGroupTest = (testName, source, expectBlocks, expectedUnfoldBlocks) => {
  const exampleAST = acorn.parse(source, { ecmaVersion: 2020 });
  const statements = exampleAST['body'];
  const manager = new BlockManager([statements]);
  const actualBlocks = manager.blocks;

  console.assert(
    actualBlocks.length === expectBlocks.length,
    `Expected ${expectBlocks.length} blocks, but got ${actualBlocks.length}`
  );
  actualBlocks.forEach((actual, index) => {
    actual.fold();
    console.assert(
      actual.getInputs().sort().toString() === expectBlocks[index].inputs.sort().toString(),
      `${testName} : block No.${index+1} inputs : actual (${actual.inputs}), expect (${expectBlocks[index].inputs})`
    );
    console.assert(
      actual.getOutputs().sort().toString() === expectBlocks[index].outputs.sort().toString(),
      `${testName} : block No.${index+1} outputs: actual (${actual.outputs}), expect (${expectBlocks[index].outputs})`
    );

    actual.unfold();
    console.assert(
      actual.getInputs().sort().toString() === expectedUnfoldBlocks[index].inputs.sort().toString(),
      `${testName} : block No.${index+1} inputs : actual (${actual.inputs}), expect (${expectedUnfoldBlocks[index].inputs})`
    );
    console.assert(
      actual.getOutputs().sort().toString() === expectedUnfoldBlocks[index].outputs.sort().toString(),
      `${testName} : block No.${index+1} outputs: actual (${actual.outputs}), expect (${expectedUnfoldBlocks[index].outputs})`
    );
  });

};