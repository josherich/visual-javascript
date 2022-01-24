import _flattenDeep from "lodash/flattenDeep";
import { Block } from "./block";
import { ExDrawArrow } from "./exDrawArrow";

/* BlockManager scan blocks and update their relations and positions */
export class BlockManager {
  constructor(statements) {
    this.blocks = [];
    this.links = [];
    this.refs = {};
    this.mutations = [];
    statements.forEach((statementNode) => {
      const keysInScope = Object.keys(this.refs)
      const block = new Block(statementNode, keysInScope);
      block.outputs.forEach((name, outputIndex) => {
        this.refs[name] = [block.id(), this.blocks.length, outputIndex];
      });
      this.blocks.push(block);
    });
    // build relations
    this.blocks.forEach((block, index) => {
      if (index < this.blocks.length - 1) {
        block.next = this.blocks[index + 1];
      }
    });
    // this.buildReference();
    this.setPositions();
    this.linkReferences();
    this.linkMutations();
  }
  setPositions() {
    let first = this.blocks[0];
    if (first) first.setPosition(0, 0);
    while (first.next) {
      first.next.followPosition(first, (x, y) => [x + 150, y]);
      first = first.next;
    }
  }
  // buildReference() {
  //   this.blocks.forEach((block, blockIndex) => {
  //     block.outputs.forEach((name, outputIndex) => {
  //       this.refs[name] = [block.id(), blockIndex, outputIndex];
  //     });
  //   });
  // }
  linkMutations() {
    // block mutation
    // block's control flow mutation
    this.mutations = this.blocks
      .filter(block => block.mutation)
      .map(block => {
        let [name, value] = block.mutation;
        let targetBlockRef = this.refs[name];
        if (targetBlockRef) {
          const targetBlock = this.blocks[targetBlockRef[1]];
          const link = new ExDrawArrow({
            startElement: block.id(),
            endElement: targetBlock.id(),
            startPosition: block.getMutationPosition(),
            endPosition: targetBlock.getMutationPosition(),
            style: "dotted",
          });
          block.link(link);
          targetBlock.link(link);
          return link;
        } else {
          console.warn(`${name} is not defined.`);
          return null;
        }
    }).filter(e => e);
  }
  linkReferences() {
    this.blocks.forEach((block, toBlockIndex) => {
      block.inputs.forEach((name, toIndex) => {
        if (this.refs[name]) {
          const [, fromBlockIndex, fromIndex] = this.refs[name];
          const from = this.blocks[fromBlockIndex];
          const to = this.blocks[toBlockIndex];
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
    return _flattenDeep([
      this.blocks.map((block) => block.get()),
      this.links.map((link) => link.get()),
      this.mutations.map((mutation) => mutation.get())
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
