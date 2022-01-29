import { runBlockTest } from './block';
const source = `
if (c + b > 0) {
  a = 0;
  b = 3;
} else {
  a = 1;
}
`

const blocks = [
  { inputs: ["c", "b"], outputs: [], controlFlows: {"True":{}, "False":{}} },
]

runBlockTest('IfExpression', source, blocks);