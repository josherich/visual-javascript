import { parse } from "@babel/parser";

const selfSource = `import { ExDrawBlock } from "../excalidraw/exDrawBlock";
import { ExDrawArrow } from "../excalidraw/exDrawArrow";
import { BlockGroup } from "./blockGroup";

import {
  parseInputs,
  parseOutputs,
  parseMutation,
  parseControlFlows,
  parseSourceCode,
  parseEditData,
  parseTitle,
  parseContent,
  setNode,
} from "./blockParser";

/* Block is the AST representation that manages UI elements */
export class Block {
  constructor({ node, keysInScope, getCode, groupId } = {}) {
    this.name = node.type;
    this.keysInScope = keysInScope;
    this.getCode = getCode;
    this.groupId = groupId;
    this.node = node;

    this.inputs = parseInputs(node); // var deps
    this.outputs = parseOutputs(node, keysInScope); // if var declaration
    this.mutation = parseMutation(node);
    this.controlFlows = parseControlFlows(node); // control flow statement
    this.sourceCode = parseSourceCode(node, getCode);
    this.editData = parseEditData(node);

    this.title = parseTitle(node, getCode);
    this.content = parseContent(node, getCode);

    this.prev = null;
    this.next = null;
    this.position = null;
    this.exBlock = null;
    this.controlFlowBlocks = null;
    this.layoutNode = null;
    this.links = [];

    this.drawBlock();
  }

  drawBlock() {
    this.exBlock = new ExDrawBlock({
      title: this.title,
      inputs: this.inputs,
      outputs: this.outputs,
      content: this.content,
      controlFlows: Object.keys(this.controlFlows),
      groupId: this.groupId,
      isControlFlow: this.isControlFlowBlock(),
    });

    this.drawControlFlow();
    this.drawClassMethods();
  }
}`;

const exampleSource = `
let z = { x: 0, y: 0 }, s;
var b = 5;
b = 2;
function addA(d) {
  return a + d;
}
c = addA(2) + b;
while (c > 0) {
  c = c - 1;
  if (c > 0) {
    a = a - 1;
    break;
  } else {
    continue;
  }
}
var x = a + b;
`;
const mandelbrotSource = `const MAX_ITERATION = 80;
function mandelbrot(c) {
    let z = { x: 0, y: 0 }, n = 0, p, d;
    do {
        p = {
            x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
            y: 2 * z.x * z.y
        }
        z = {
            x: p.x + c.x,
            y: p.y + c.y
        }
        d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2))
        n += 1
    } while (d <= 2 && n < MAX_ITERATION)
    return [n, d <= 2]
}
const a = 1;
mandelbrot(a);`;

const quickSortSource = `
const kCutOff = 1;
function quickSort(left, right) {
  if (right - left > kCutOff) {
    const pivot = choosePivotElement(left, right);  // Important but not focus here
    const p = Partition(pivot, left, right);  // The main work loop
    quickSort(left, p);
    quickSort(p, right);  // Tail call, ideally the largest sub-interval
  } else {
    sortSmallArray(left, right);
  }
}
function HoarePartition(pivot, left, right) {
  while (left < right) {
    left = scanForward(pivot, left, right);
    if (left === right) break;
    right = scanBackward(pivot, left, right);
    if (left === right) break;
    swap(left, right);
  }
  return left;
}
function lomutoPartition(pivot, left, right) {
  const p = left;
  for (let i = left; i <= right; i++) {
    if (i < pivot) {
      swap(i, p);
      p++;
    }
  }
  return p;
}
`
export const exampleAST = parse(selfSource, { ecmaVersion: 2020, sourceType: "module" });
export const source = selfSource;