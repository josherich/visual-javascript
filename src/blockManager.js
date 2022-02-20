import _flattenDeep from "lodash/flattenDeep";
import { ExDrawArrow } from "./exDrawArrow";
import { Springy } from "./layout";
import { BlockFactory } from "./blockFactory";
import generate from "@babel/generator";

/* BlockManager scan blocks and update their relations and positions */
export class BlockManager {
  constructor(statements, source) {
    this.blocks = [];
    this.links = [];
    this.sequence = [];
    this.refs = {};
    this.mutations = [];
    this.source = source;

    this.showRefs = false;
    this.showMutations = false;

    // ======== layout =========
    this.graph = new Springy.Graph();
    this.statements = statements;

    statements.forEach((statementNode) => {
      const keysInScope = Object.keys(this.refs);
      const block = BlockFactory({node: statementNode, keysInScope, getCode: this.getCode.bind(this)});

      const layoutNode = this.graph.newNode({ label: statementNode.type });
      block.setLayoutNode(layoutNode);

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
    this.linkSequence();
    this.linkReferences();
    this.linkMutations();

    // this.getLayout();
  }
  setPositions() {
    let first = this.blocks[0];
    let index = 0;
    if (first) first.setPosition(300, 150);
    while (first.next) {
      const [w, h] = first.getSize();
      first.next.followPosition(first, (x, y) => [x + w + 30, y + (index % 2 === 0 ? 120 : -120)]);
      first = first.next;
      index++;
    }
  }
  toggleReferences() {
    this.showRefs = !this.showRefs;
  }
  toggleMutations() {
    this.showMutations = !this.showMutations;
  }
  // buildReference() {
  //   this.blocks.forEach((block, blockIndex) => {
  //     block.outputs.forEach((name, outputIndex) => {
  //       this.refs[name] = [block.id(), blockIndex, outputIndex];
  //     });
  //   });
  // }
  linkMutation(block, mutation) {
    let [name, value] = mutation;
    let targetBlockRef = this.refs[name];
    if (targetBlockRef) {
      const targetBlock = this.blocks[targetBlockRef[1]];
      const link = new ExDrawArrow({
        type: "mutation",
        startElement: block.id(),
        endElement: targetBlock.id(),
        startPosition: block.getMutationPosition(),
        endPosition: targetBlock.getMutationPosition(),
        style: "dotted",
      });
      block.link(link);
      targetBlock.link(link);
      // this.graph.newEdge(block.layoutNode, targetBlock.layoutNode);
      this.mutations.push(link);
    } else {
      console.warn(`${name} is not defined.`);
    }
  }
  linkMutations() {
    // block mutation
    // block's control flow mutation
    this.mutations = [];
    this.blocks
      .filter((block) => block.mutation)
      .forEach((block) => {
        block.getMutations().forEach(mutation => {
          this.linkMutation(block, mutation);
        });
      });
    this.blocks.forEach(block => {
      block.controlFlowBlocks.forEach(controlFlowblock => {
        controlFlowblock.getMutations().forEach(_mutation => {
          this.linkMutation(controlFlowblock, _mutation);
        });
      });
    })
  }
  linkReferences() {
    this.blocks.forEach((block, toBlockIndex) => {
      block.getInputs().forEach((name, toIndex) => {
        if (this.refs[name]) {
          const [, fromBlockIndex, fromIndex] = this.refs[name];
          const from = this.blocks[fromBlockIndex];
          const to = this.blocks[toBlockIndex];
          this.link(from, to, fromIndex, toIndex);
          this.graph.newEdge(from.layoutNode, to.layoutNode);
        }
      });
      block.controlFlowBlocks.forEach((controlFlowBlock) => {
        controlFlowBlock.getInputs().forEach((name, toIndex) => {
          if (this.refs[name]) {
            const [, fromBlockIndex, fromIndex] = this.refs[name];
            const from = this.blocks[fromBlockIndex];
            const to = controlFlowBlock;
            this.link(from, to, fromIndex, toIndex);
          }
        });
      });
    });
  }
  linkSequence(a, b) {
    const linkSequence = (a, b) => {
      const link = new ExDrawArrow({
        type: "sequence",
        startElement: a.id(),
        endElement: b.id(),
        startPosition: a.getControlFlowOutPosition(),
        endPosition: b.getControlFlowInPosition(),
      });
      a.link(link);
      b.link(link);
      this.sequence.push(link);
    };
    const linkBreakReturn = (a, b) => {
      const link = new ExDrawArrow({
        type: "sequence",
        startElement: a.id(),
        endElement: b.id(),
        startPosition: a.getControlFlowOutPosition(),
        endPosition: b.getControlFlowInPosition(),
      });
      a.link(link);
      b.link(link);
      this.sequence.push(link);
    };
    this.blocks.forEach((block, index) => {
      if (index < this.blocks.length - 1) {
        linkSequence(block, this.blocks[index + 1]);
        block.getBreakReturnBlocks().forEach((breakReturnBlock) => {
          linkBreakReturn(breakReturnBlock, this.blocks[index + 1]);
        });
      }
    });
  }
  link(a, b, fromIndex, toIndex) {
    const link = new ExDrawArrow({
      type: "ref",
      startElement: a.id(),
      endElement: b.id(),
      startPosition: a.getOutputPosition(fromIndex),
      endPosition: b.getInputPosition(toIndex),
    });
    a.link(link);
    b.link(link);
    this.links.push(link);
  }
  getSource() {
    return this.source;
  }
  getCode(node) {
    if (node.start === undefined && node.end === undefined) return "";

    return this.source.slice(node.start, node.end);
  }
  getExDrawElements() {
    return _flattenDeep([
      this.blocks.map((block) => block.get()),
      this.sequence.map((link) => link.get()),
      this.showRefs ? this.links.map((link) => link.get()) : [],
      this.showMutations ? this.mutations.map((mutation) => mutation.get()) : [],
    ]);
  }
  getLayout() {
    const layout = new Springy.Layout.ForceDirected(
      this.graph,
      400.0, // Spring stiffness
      400.0, // Node repulsion
      0.5 // Damping
    );
    const that = this;
    this.renderer = new Springy.Renderer(
      layout,
      function clear() {
        // code to clear screen
        console.log("clear");
      },
      function drawEdge(edge, p1, p2) {
        // draw an edge
        console.log(edge, p1, p2);
      },
      function drawNode(node, p) {
        // draw a node
        console.log(node, p);
      },
      function onRenderStop() {
        // code to run when the layout has stopped
        console.log("stop");
        const nodes = Object.values(this.nodePoints).map((node) => [
          node.p.x * 10,
          node.p.y * 10,
        ]);
        console.log(nodes);
      }
    );
    this.renderer.start();
  }

  generate() {
    return generate({
      type: "Program",
      end: 444,
      sourceType: "script",
      start: 0,
      body: this.statements
    }, {
      comments: true
    })
  }
}
