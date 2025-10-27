import { isErr } from "trynot";
import { buildSerialTree } from "./build-serial-tree";
import { buildTree } from "./build-tree";
import { getLeaf } from "./get-leaf";
import { getLeaves } from "./get-leaves";
import { getProof } from "./get-proof";
import { getRangeProof } from "./get-range-proof";
import { getRoot } from "./get-root";
import { getSibling } from "./get-sibling";
import type { MerkleTree, MerkleTreeConfig, Range, SerialProofs } from "./types";
import { verifyProof } from "./verify-proof";
import { verifyRangeProof } from "./verify-range-proof";

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
