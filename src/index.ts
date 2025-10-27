export type { MerkleTreeInstance } from "./core/factory/create-merkle-tree";
export { createMerkleTree } from "./core/factory/create-merkle-tree";
export type { SerialMerkleTreeInstance } from "./core/factory/create-serial-merkle-tree";
export { createSerialMerkleTree } from "./core/factory/create-serial-merkle-tree";
export { buildSerialTree } from "./core/functions/build-serial-tree";
export { buildTree } from "./core/functions/build-tree";
export { getLeaf } from "./core/functions/get-leaf";
export { getLeaves } from "./core/functions/get-leaves";
export { getProof } from "./core/functions/get-proof";
export { getRangeProof } from "./core/functions/get-range-proof";
export { getRoot } from "./core/functions/get-root";
export { getSibling } from "./core/functions/get-sibling";
export { verifyProof } from "./core/functions/verify-proof";
export { verifyRangeProof } from "./core/functions/verify-range-proof";
export type {
  LayerIndex,
  MerkleTree,
  MerkleTreeConfig,
  SerialMerkleTree,
  SerialProof,
} from "./core/types";
