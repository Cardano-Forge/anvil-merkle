import {
  type DataHash,
  hash_plutus_data,
  PlutusData,
  PlutusList,
} from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { sortBuffers } from "../lib/sort-buffers";
import { MerkleTree } from "../tree";

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
      combineNodes: (left: DataHash, right: DataHash): DataHash => {
        const bytes = sortBuffers([left, right].map((hash) => hash.to_bytes()));
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
