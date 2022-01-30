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
while (c > 0) {
  c = c - 1;
}
if (c + b > 0) {
  a = 0;
  if (a) {
    b = 3;
  }
} else {
  a = 1;
}
`;
export const exampleAST = acorn.parse(exampleSource, { ecmaVersion: 2020 });
export const source = exampleSource;