import { BigInt as CslBigInt, PlutusData } from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { createMerkleTree, createSerialMerkleTree } from "../core/factory";
import { type CslMerkleTreeOpts, createCslMerkleTreeConfig } from "./config";

export function createCslMerkleTree<TElement>(
  elements: TElement[],
  opts: CslMerkleTreeOpts<TElement>,
) {
  return createMerkleTree(elements, createCslMerkleTreeConfig(opts));
}

export function createCslSerialMerkleTree(elements: number[]) {
  return createSerialMerkleTree(
    elements,
    createCslMerkleTreeConfig({
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    }),
  );
}
