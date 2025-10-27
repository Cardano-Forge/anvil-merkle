import type { Result } from "trynot";
import { buildTree } from "./build-tree";
import type { MerkleTreeConfig, SerialMerkleTree } from "./types";

export function buildSerialTree<TNode>(
  elements: number[],
  config: MerkleTreeConfig<TNode, number>,
): Result<SerialMerkleTree<TNode>> {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (Math.abs(element) !== i + 1) {
      return new Error(
        "Serial merkle tree elements must contain only consecutive integers starting from 1. Sign of element can be negative",
      );
    }
  }

  return buildTree(elements, config);
}
