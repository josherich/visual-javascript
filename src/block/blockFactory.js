import { BlockGroup } from "./blockGroup";
import { FunctionBlock } from "./functionBlock";
import { Block } from "./block";

// three types of blocks: function, single statement, multi statements
export const BlockFactory = ({ node, keysInScope, getCode }={}) => {
  if (node.type === "FunctionDeclaration") {
    return new FunctionBlock({
      node,
      keysInScope,
      getCode,
      signature: [node.id.name, node.params.map(p => p.name)],
    });
  } else if (Array.isArray(node)) {
    return new BlockGroup({
      nodes: node,
      keysInScope,
      getCode
    });
  } else {
    return new Block({
      node,
      keysInScope,
      getCode
    })
  }
}