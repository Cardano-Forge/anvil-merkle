import type { Result } from "trynot";
import type { MerkleTree } from "../types";
import { getLeaf } from "./get-leaf";
import { getSibling } from "./get-sibling";

export function getProof<TNode, TElement>(
  tree: MerkleTree<TNode, TElement>,
  element: TElement,
): Result<TNode[]> {
  const leaf = getLeaf(tree, element);
  if (!leaf) {
    return new Error("Element not found");
  }
  let currentIndex = leaf.index;
  const proof: TNode[] = [];
  for (let layerIndex = 0; layerIndex < tree.layers.length - 1; layerIndex++) {
    const sibling = getSibling(tree, currentIndex, layerIndex);
    if (sibling) {
      proof.push(sibling);
    }
    currentIndex = Math.floor(currentIndex / 2);
  }
  return proof;
}
