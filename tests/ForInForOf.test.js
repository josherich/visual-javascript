import { runBlockTest } from './block';
let source, blocks;

// for...in loop
source = `
for (let key in obj) {
  result = result + obj[key];
}
`

blocks = [
  { inputs: ["obj"], outputs: ["key"], controlFlows: { "Body": {} } },
]

runBlockTest('ForInStatement', source, blocks);

// for...of loop
source = `
for (let item of arr) {
  total = total + item;
}
`

blocks = [
  { inputs: ["arr"], outputs: ["item"], controlFlows: { "Body": {} } },
]

runBlockTest('ForOfStatement', source, blocks);

// for...of loop with existing variable (no declaration)
source = `
var x;
for (x of items) {
  process(x);
}
`

blocks = [
  { inputs: [], outputs: ["x"] },
  { inputs: ["items"], outputs: [], controlFlows: { "Body": {} } },
]

runBlockTest('ForOfStatement no declaration', source, blocks);
