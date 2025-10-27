import { createHash } from "node:crypto";
import { sortBuffers } from "../lib/sort-buffers";
import { MerkleTree } from "../tree";

export class CryptoMerkleTree extends MerkleTree<Buffer, string> {
  constructor(elements: string[]) {
    super(elements, {
      elementToNode: (element) => {
        const hash = createHash("sha256");
        hash.update(element);
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
    });
  }
}
