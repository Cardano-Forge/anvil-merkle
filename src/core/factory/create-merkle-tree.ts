import { buildTree } from "../functions/build-tree";
import type { MerkleTreeConfig } from "../types";
import { createMerkleTreeInstance } from "./create-merkle-tree-instance";

export function createMerkleTree<TNode, TElement>(
  elements: TElement[],
  config: MerkleTreeConfig<TNode, TElement>,
) {
  const tree = buildTree(elements, config);
  return createMerkleTreeInstance(tree);
}

export type MerkleTreeInstance<TNode, TElement> = ReturnType<
  typeof createMerkleTree<TNode, TElement>
>;
