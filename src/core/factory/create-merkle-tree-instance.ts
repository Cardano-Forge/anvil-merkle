import { getLeaf } from "../functions/get-leaf";
import { getLeaves } from "../functions/get-leaves";
import { getProof } from "../functions/get-proof";
import { getRoot } from "../functions/get-root";
import { getSibling } from "../functions/get-sibling";
import { verifyProof } from "../functions/verify-proof";
import type { MerkleTree } from "../types";

export function createMerkleTreeInstance<TNode, TElement>(tree: MerkleTree<TNode, TElement>) {
  const { config, elements, layers } = tree;
  return {
    ...config,
    elements,
    layers,
    getLeaves: () => getLeaves(tree),
    getRoot: () => getRoot(tree),
    getLeaf: (element: TElement) => getLeaf(tree, element),
    getSibling: (index: number, layerIndex = 0) => getSibling(tree, index, layerIndex),
    getProof: (element: TElement) => getProof(tree, element),
    verifyProof: (element: TElement, proof: TNode[]) => verifyProof(tree, element, proof),
  };
}
