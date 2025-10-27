export type {
  MerkleTreeInstance,
  SerialMerkleTreeInstance,
} from "./core/factory";
export {
  createMerkleTree,
  createSerialMerkleTree,
} from "./core/factory";
export {
  buildSerialTree,
  buildSerialTreeFromLength,
  buildTree,
  getLeaf,
  getLeaves,
  getProof,
  getRangeProof,
  getRoot,
  getSibling,
  verifyProof,
  verifyRangeProof,
} from "./core/functions";
export type {
  LayerIndex,
  MerkleTree,
  MerkleTreeConfig,
  SerialMerkleTree,
  SerialProof,
} from "./core/types";
