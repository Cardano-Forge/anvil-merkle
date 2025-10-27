import type { MerkleTree } from "../types";
import { getLeaf } from "./get-leaf";
import { getRoot } from "./get-root";

export function verifyProof<TNode, TElement>(
  tree: MerkleTree<TNode, TElement>,
  element: TElement,
  proof: TNode[],
): boolean {
  const leaf = getLeaf(tree, element);
  if (!leaf) {
    return false;
  }
  let node = leaf.node;
  for (const sibling of proof) {
    node = tree.config.combineNodes(node, sibling);
  }
  return tree.config.compareNodes(node, getRoot(tree));
}
