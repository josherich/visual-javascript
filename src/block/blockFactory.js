import { BlockGroup } from "./blockGroup";
import { FunctionBlock } from "./functionBlock";
import { Block } from "./block";
import _uniqueId from "lodash/uniqueId";

// three types of blocks: function, single statement, multi statements
export const BlockFactory = ({ node, keysInScope, getCode, textMode = false }={}) => {
  if (node.type === "FunctionDeclaration") {
    return new FunctionBlock({
      node,
      keysInScope,
      getCode,
      signature: [node.id.name, node.params.map(p => p.name)],
      groupId: _uniqueId('function-block-'),
      textMode,
    });
  } else if (Array.isArray(node)) {
    return new BlockGroup({
      nodes: node,
      keysInScope,
      getCode,
      groupId: _uniqueId('block-group-'),
      textMode,
    });
  } else {
    return new Block({
      node,
      keysInScope,
      getCode,
      groupId: _uniqueId('block-'),
      textMode,
    })
  }
}