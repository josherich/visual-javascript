import { runBlockTest, runBlockGroupTest } from './block';
let source, blocks, unfoldBlocks;

source = `
var a = 42;
var b = 5;
function addA(d) {
  return a + d;
}
c = addA(2) + b;
`

blocks = [
  { inputs: [], outputs: ["a"] },
  { inputs: [], outputs: ["b"] },
  { inputs: ["a"], outputs: ["addA"] },
  { inputs: ["addA", "b"], outputs: ["c"] },
]

runBlockTest('base', source, blocks);

source = `
var a = 42;
var b = 5;
`;

blocks = [
  { inputs: [], outputs: ["a", "b"] },
];

unfoldBlocks = [
  { inputs: [[],[]], outputs: [["a"], ["b"]] },
]

runBlockGroupTest('base', source, blocks, unfoldBlocks);