import type { MerkleTree } from "../types";

export function getLeaves<TNode, TElement>(tree: MerkleTree<TNode, TElement>): readonly TNode[] {
  return tree.layers[0];
}
