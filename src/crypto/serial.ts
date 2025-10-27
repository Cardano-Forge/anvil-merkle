import { SerialMerkleTree } from "../serial";
import { createCryptoMerkleTreeConfig } from "./config";

export class CryptoSerialMerkleTree extends SerialMerkleTree<Buffer> {
  constructor(elements: number[]) {
    super(elements, createCryptoMerkleTreeConfig());
  }
}
