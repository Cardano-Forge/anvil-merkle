import { MerkleTree } from "../tree";
import { createCryptoMerkleTreeConfig } from "./config";

export class CryptoMerkleTree<TElement> extends MerkleTree<Buffer, TElement> {
  constructor(elements: TElement[]) {
    super(elements, createCryptoMerkleTreeConfig());
  }
}
