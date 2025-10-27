export { createMerkleTree, type MerkleTreeInstance } from "./factory/create-merkle-tree";
export {
  createSerialMerkleTree,
  type SerialMerkleTreeInstance,
} from "./factory/create-serial-merkle-tree";

export { buildSerialTree } from "./functions/build-serial-tree";
export { buildTree } from "./functions/build-tree";
export { getLeaf } from "./functions/get-leaf";
export { getLeaves } from "./functions/get-leaves";
export { getProof } from "./functions/get-proof";
export { getRangeProof } from "./functions/get-range-proof";
export { getRoot } from "./functions/get-root";
export { getSibling } from "./functions/get-sibling";
export { verifyProof } from "./functions/verify-proof";
export { verifyRangeProof } from "./functions/verify-range-proof";

export type {
  LayerIndex,
  MerkleTree,
  MerkleTreeConfig,
  SerialMerkleTree,
  SerialProof,
} from "./types";
