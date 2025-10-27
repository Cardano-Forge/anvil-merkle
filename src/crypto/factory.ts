import { createMerkleTree, createSerialMerkleTree } from "../core/factory";
import { createCryptoMerkleTreeConfig } from "./config";

export function createCryptoMerkleTree<TElement>(elements: TElement[]) {
  return createMerkleTree(elements, createCryptoMerkleTreeConfig<TElement>());
}

export function createCryptoSerialMerkleTree(elements: number[]) {
  return createSerialMerkleTree(elements, createCryptoMerkleTreeConfig<number>());
}
