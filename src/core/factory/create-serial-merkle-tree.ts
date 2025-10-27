import { isErr } from "trynot";
import { buildSerialTree } from "../functions/build-serial-tree";
import { getRangeProof } from "../functions/get-range-proof";
import { verifyRangeProof } from "../functions/verify-range-proof";
import type { MerkleTreeConfig, Range, SerialProofs } from "../types";
import { createMerkleTreeInstance } from "./create-merkle-tree-instance";

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

export type SerialMerkleTreeInstance<TNode> = ReturnType<typeof createSerialMerkleTree<TNode>>;
