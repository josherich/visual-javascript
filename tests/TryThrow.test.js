import { runBlockTest } from './block';
let source, blocks;

// try/catch statement
source = `
try {
  result = doSomething();
} catch (e) {
  result = null;
}
`

blocks = [
  { inputs: [], outputs: [], controlFlows: { "Try": {}, "Catch": {} } },
]

runBlockTest('TryStatement try/catch', source, blocks);

// try/catch/finally statement
source = `
try {
  result = doSomething();
} catch (e) {
  result = null;
} finally {
  cleanup();
}
`

blocks = [
  { inputs: [], outputs: [], controlFlows: { "Try": {}, "Catch": {}, "Finally": {} } },
]

runBlockTest('TryStatement try/catch/finally', source, blocks);

// try/finally without catch
source = `
try {
  result = doSomething();
} finally {
  cleanup();
}
`

blocks = [
  { inputs: [], outputs: [], controlFlows: { "Try": {}, "Finally": {} } },
]

runBlockTest('TryStatement try/finally', source, blocks);

// throw statement
source = `
throw new Error("something went wrong");
`

blocks = [
  { inputs: [], outputs: [], controlFlows: { "Exit": {} } },
]

runBlockTest('ThrowStatement', source, blocks);
