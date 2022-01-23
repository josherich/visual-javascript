import _flattenDeep from "lodash/flattenDeep";
import { Block } from "./block";
import { ExDrawArrow } from "./exDrawArrow";

export class BlockManager {
  constructor(statements) {
    this.blocks = [];
    this.links = [];
    this.refs = {};
    statements.forEach((statementNode) => {
      this.blocks.push(new Block(statementNode));
    });
    // build relations
    this.blocks.forEach((block, index) => {
      if (index < this.blocks.length - 1) {
        block.next = this.blocks[index + 1];
      }
    });
    this.buildReference();
    this.setPositions();
    this.linkReference();
  }
  setPositions() {
    let first = this.blocks[0];
    if (first) first.setPosition(0, 0);
    while (first.next) {
      first.next.followPosition(first, (x, y) => [x + 150, y]);
      first = first.next;
    }
  }
  buildReference() {
    this.blocks.forEach((block, blockIndex) => {
      block.outputs.forEach((name, outputIndex) => {
        this.refs[name] = [block.id(), blockIndex, outputIndex];
      });
    });
  }
  linkReference() {
    this.blocks.forEach((block, toBlockIndex) => {
      block.inputs.forEach((name, toIndex) => {
        if (this.refs[name]) {
          const [, fromBlockIndex, fromIndex] = this.refs[name];
          const from = this.blocks[fromBlockIndex];
          const to = this.blocks[toBlockIndex];
          console.log(fromBlockIndex, toBlockIndex, fromIndex, toIndex);
          this.link(from, to, fromIndex, toIndex);
        }
      });
    });
  }
  link(a, b, fromIndex, toIndex) {
    const link = new ExDrawArrow({
      startElement: a.id(),
      endElement: b.id(),
      startPosition: a.getOutputPosition(fromIndex),
      endPosition: b.getInputPosition(toIndex)
    });
    a.link(link);
    b.link(link);
    this.links.push(link);
  }
  getExDrawElements() {
    console.log(this.links.map((link) => link.get()));
    return _flattenDeep([
      this.blocks.map((block) => block.exBlock.get()),
      this.links.map((link) => link.get())
    ]);
  }

  // test
  testExampleAST() {
    console.assert(
      this.blocks[0].inputs.toString() === "",
      this.blocks[0].inputs
    );
    console.assert(
      this.blocks[0].outputs.toString() === "a",
      this.blocks[0].outputs
    );

    console.assert(
      this.blocks[1].inputs.toString() === "",
      this.blocks[1].inputs
    );
    console.assert(
      this.blocks[1].outputs.toString() === "b",
      this.blocks[1].outputs
    );

    console.assert(
      this.blocks[2].inputs.toString() === "a",
      "func inputs" + this.blocks[2].inputs
    );
    console.assert(
      this.blocks[2].outputs.toString() === "addA",
      "func outputs" + this.blocks[2].outputs
    );

    console.assert(
      this.blocks[3].inputs.toString() === "addA,b",
      "exprstat inputs" + this.blocks[3].inputs
    );
    console.assert(
      this.blocks[3].outputs.toString() === "c",
      "exprstat outputs" + this.blocks[3].outputs
    );
  }
}
