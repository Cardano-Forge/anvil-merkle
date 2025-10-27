import { isErr, isOk, type Result } from "trynot";
import type { SerialMerkleTree, SerialProof } from "../types";
import { getLeaf } from "./get-leaf";
import { getRoot } from "./get-root";

export function verifyRangeProof<TNode>(
  tree: SerialMerkleTree<TNode>,
  range: [number, number],
  proofs: [SerialProof<TNode>[], SerialProof<TNode>[]],
): boolean {
  const [start, end] = range;

  const leftProof = [...proofs[0]];
  const rightProof = [...proofs[1]];

  const leaves: TNode[] = [];
  for (let i = start; i <= end; i++) {
    const leaf = getLeaf(tree, i);
    if (!leaf) {
      return false;
    }
    leaves.push(leaf.node);
  }

  const extendLayer = (layer: TNode[], layerIdx: number): Result<TNode[]> => {
    if (leftProof[0]?.[0] === layerIdx) {
      const proof = leftProof.shift();
      if (!proof) {
        return new Error("Left proof not found");
      }
      const [, node] = proof;
      layer.unshift(node);
    }
    if (rightProof[0]?.[0] === layerIdx) {
      const proof = rightProof.shift();
      if (!proof) {
        return new Error("Right proof not found");
      }
      const [, node] = proof;
      layer.push(node);
    }
    return layer;
  };

  let layerIdx = 0;
  let layer = extendLayer([...leaves], layerIdx);

  while (isOk(layer) && layer.length > 1) {
    const nextLayer: TNode[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1];
      if (right) {
        nextLayer.push(tree.config.combineNodes(left, right));
      } else {
        nextLayer.push(left);
      }
    }
    layer = nextLayer;
    layerIdx++;
    layer = extendLayer(layer, layerIdx);
  }

  if (isErr(layer)) {
    return false;
  }

  const computedRoot = layer[0];
  return tree.config.compareNodes(computedRoot, getRoot(tree));
}
