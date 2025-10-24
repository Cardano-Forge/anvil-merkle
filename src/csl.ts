import {
  type DataHash,
  hash_plutus_data,
  PlutusData,
  PlutusList,
} from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { MerkleTree } from "./abstract";

export type CslMerkleTreeConfig<TElement> = {
  elementToPlutusData: (element: TElement) => PlutusData;
};

export class CslMerkleTree<TElement> extends MerkleTree<DataHash, TElement> {
  constructor(elements: TElement[], config: CslMerkleTreeConfig<TElement>) {
    super(elements, {
      elementToNode: (element) => {
        const plutusData = config.elementToPlutusData(element);
        return hash_plutus_data(plutusData);
      },
      getLeaf: (element: TElement): { node: DataHash; index: number } | undefined => {
        const index = this.elements.indexOf(element);
        if (index === -1) {
          return undefined;
        }
        const node = this.leaves[index];
        return { node, index };
      },
      combineNodes: (left: DataHash, right: DataHash): DataHash => {
        const bytes = [left, right]
          .map((hash) => hash.to_bytes())
          .sort((a, b) => {
            const minLength = Math.min(a.length, b.length);
            for (let i = 0; i < minLength; i++) {
              if (a[i] !== b[i]) {
                return a[i] - b[i];
              }
            }
            return a.length - b.length;
          });
        const list = PlutusList.new();
        for (const hashBytes of bytes) {
          list.add(PlutusData.new_bytes(hashBytes));
        }
        return hash_plutus_data(PlutusData.new_list(list));
      },
      compareNodes: (left: DataHash, right: DataHash): boolean => {
        return left.to_hex() === right.to_hex();
      },
    });
  }
}
