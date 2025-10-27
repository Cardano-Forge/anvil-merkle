import type { MerkleTree } from "../types";

export function getLeaf<TNode, TElement>(
  tree: MerkleTree<TNode, TElement>,
  element: TElement,
): { node: TNode; index: number } | undefined {
  const index = tree.elements.indexOf(element);
  if (index === -1) {
    return undefined;
  }
  const node = tree.layers[0][index];
  return { node, index };
}
