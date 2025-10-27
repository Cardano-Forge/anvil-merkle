import { createHash } from "node:crypto";
import { sortBuffers } from "../lib/sort-buffers";
import type { MerkleTreeConfig } from "../tree";

export function createCryptoMerkleTreeConfig<TElement>(): MerkleTreeConfig<Buffer, TElement> {
  return {
    elementToNode: (element) => {
      const hash = createHash("sha256");
      hash.update(String(element));
      return hash.digest();
    },
    combineNodes: (left: Buffer, right: Buffer): Buffer => {
      const nodes = sortBuffers([left, right]);
      const hash = createHash("sha256");
      hash.update(nodes[0]);
      hash.update(nodes[1]);
      return hash.digest();
    },
    compareNodes: (left: Buffer, right: Buffer): boolean => {
      return left.equals(right);
    },
  };
}
