import { runBlockTest } from './block';
let source, blocks;

// switch statement with cases
source = `
switch (action) {
  case "increment":
    count = count + 1;
    break;
  case "decrement":
    count = count - 1;
    break;
  default:
    count = 0;
}
`

blocks = [
  { inputs: ["action"], outputs: [], controlFlows: { "Case_1": {}, "Case_2": {}, "Default": {} } },
]

runBlockTest('SwitchStatement with default', source, blocks);

// switch statement without default
source = `
switch (x) {
  case 1:
    result = "one";
    break;
  case 2:
    result = "two";
    break;
}
`

blocks = [
  { inputs: ["x"], outputs: [], controlFlows: { "Case_1": {}, "Case_2": {} } },
]

runBlockTest('SwitchStatement no default', source, blocks);
