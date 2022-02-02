import { BlockGroup } from "./blockGroup";
import { FunctionBlock } from "./functionBlock";
import { Block } from "./block";

export const BlockFactory = ({node, keysInScope, getCode, groupId}={}) => {
  if (node.type === "FunctionDeclaration") {
    return new FunctionBlock({
      nodes: node.body.body,
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