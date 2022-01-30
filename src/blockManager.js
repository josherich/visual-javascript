import _flattenDeep from "lodash/flattenDeep";
import { Block } from "./block";
import { BlockGroup } from "./blockGroup";
import { ExDrawArrow } from "./exDrawArrow";
import { Springy } from "./layout";

/* BlockManager scan blocks and update their relations and positions */
export class BlockManager {
  constructor(statements, source) {
    this.blocks = [];
    this.links = [];
    this.sequence = [];
    this.refs = {};
    this.mutations = [];
    this.source = source;

    // ======== layout =========
    this.graph = new Springy.Graph();

    statements.forEach((statementNode) => {
      const keysInScope = Object.keys(this.refs);
      const block = Array.isArray(statementNode)
        ? new BlockGroup({
            nodes: statementNode,
            keysInScope,
            getCode: this.getCode.bind(this),
          })
        : new Block({
            node: statementNode,
            keysInScope,
            getCode: this.getCode.bind(this),
          });

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
    // this.linkReferences();
    // this.linkMutations();

    // this.getLayout();
  }
  setPositions() {
    let first = this.blocks[0];
    if (first) first.setPosition(0, 0);
    while (first.next) {
      first.next.followPosition(first, (x, y) => [x + 250, y]);
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
      .filter((block) => block.mutation)
      .map((block) => {
        let [name, value] = block.mutation;
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
          this.graph.newEdge(block.layoutNode, targetBlock.layoutNode);
          return link;
        } else {
          console.warn(`${name} is not defined.`);
          return null;
        }
      })
      .filter((e) => e);
  }
  linkReferences() {
    this.blocks.forEach((block, toBlockIndex) => {
      block.inputs.forEach((name, toIndex) => {
        if (this.refs[name]) {
          const [, fromBlockIndex, fromIndex] = this.refs[name];
          const from = this.blocks[fromBlockIndex];
          const to = this.blocks[toBlockIndex];
          this.link(from, to, fromIndex, toIndex);
          this.graph.newEdge(from.layoutNode, to.layoutNode);
        }
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
    }
    this.blocks.forEach((block, index) => {
      if (index < this.blocks.length - 1) {
        linkSequence(block, this.blocks[index + 1]);
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
  getCode(node) {
    if (node.start === undefined && node.end === undefined) return "";

    return this.source.slice(node.start, node.end);
  }
  getExDrawElements() {
    return _flattenDeep([
      this.blocks.map((block) => block.get()),
      this.links.map((link) => link.get()),
      this.sequence.map((link) => link.get()),
      this.mutations.map((mutation) => mutation.get()),
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
}
