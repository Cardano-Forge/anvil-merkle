import { isErr } from "trynot";
import {
  buildSerialTree,
  buildTree,
  getLeaf,
  getLeaves,
  getProof,
  getRangeProof,
  getRoot,
  getSibling,
  verifyProof,
  verifyRangeProof,
} from "./functions";
import type { MerkleTree, MerkleTreeConfig, Range, SerialProofs } from "./types";

export function createMerkleTree<TNode, TElement>(
  elements: TElement[],
  config: MerkleTreeConfig<TNode, TElement>,
) {
  const tree = buildTree(elements, config);
  return createMerkleTreeInstance(tree);
}

export function createSerialMerkleTree<TNode>(
  elements: number[],
  config: MerkleTreeConfig<TNode, number>,
) {
  const tree = buildSerialTree(elements, config);
  if (isErr(tree)) {
    return tree;
  }

  return {
    ...createMerkleTreeInstance(tree),
    getRangeProof: (range: Range) => getRangeProof(tree, range),
    verifyRangeProof: (range: Range, proofs: SerialProofs<TNode>) =>
      verifyRangeProof(tree, range, proofs),
  };
}

export function createMerkleTreeInstance<TNode, TElement>(tree: MerkleTree<TNode, TElement>) {
  return {
    ...tree,
    getLeaves: () => getLeaves(tree),
    getRoot: () => getRoot(tree),
    getLeaf: (element: TElement) => getLeaf(tree, element),
    getSibling: (index: number, layerIndex = 0) => getSibling(tree, index, layerIndex),
    getProof: (element: TElement) => getProof(tree, element),
    verifyProof: (element: TElement, proof: TNode[]) => verifyProof(tree, element, proof),
  };
}

export type MerkleTreeInstance<TNode, TElement> = ReturnType<
  typeof createMerkleTree<TNode, TElement>
>;

export type SerialMerkleTreeInstance<TNode> = ReturnType<typeof createSerialMerkleTree<TNode>>;
