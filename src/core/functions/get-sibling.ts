import type { MerkleTree } from "../types";

/**
 * Gets the sibling of a node at a given index and layer.
 */
export function getSibling<TNode, TElement>(
  tree: MerkleTree<TNode, TElement>,
  index: number,
  layerIndex = 0,
): TNode | undefined {
  const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
  return tree.layers[layerIndex][siblingIndex] ?? undefined;
}
