import { runBlockTest } from './block';
let source, blocks;

// for loop with declared loop variable
source = `
for (let i = 0; i < 10; i++) {
  sum = sum + i;
}
`

blocks = [
  { inputs: [], outputs: [], controlFlows: { "Body": {} } },
]

runBlockTest('ForStatement basic', source, blocks);

// for loop referencing an outer variable in the condition
source = `
for (let i = 0; i < n; i++) {
  result = result + i;
}
`

blocks = [
  { inputs: ["n"], outputs: [], controlFlows: { "Body": {} } },
]

runBlockTest('ForStatement outer variable in test', source, blocks);

// for loop without init (loop var from outer scope)
source = `
var i = 0;
for (; i < 10; i++) {
  total = total + i;
}
`

blocks = [
  { inputs: [], outputs: ["i"] },
  { inputs: ["i"], outputs: [], controlFlows: { "Body": {} } },
]

runBlockTest('ForStatement no init', source, blocks);
