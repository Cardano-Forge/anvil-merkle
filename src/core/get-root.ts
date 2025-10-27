import type { MerkleTree } from "./types";

export function getRoot<TNode, TElement>(tree: MerkleTree<TNode, TElement>): TNode {
  return tree.layers[tree.layers.length - 1][0];
}
