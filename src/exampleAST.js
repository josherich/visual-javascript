const acorn = require("acorn");
const exampleSource = `
var a = 42;
a = 1;
var b = 5;
b = 2;
function addA(d) {
  return a + d;
}
c = addA(2) + b;
if (c + b > 0) {
  a = 0;
} else {
  a = 1;
}
`;
export const exampleAST = acorn.parse(exampleSource, { ecmaVersion: 2020 });
export const getCode = (node) => {
  if (node.start === undefined && node.end === undefined) return "";

  return exampleSource.slice(node.start, node.end);
}