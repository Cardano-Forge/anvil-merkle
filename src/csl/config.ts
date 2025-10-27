import {
  type DataHash,
  hash_plutus_data,
  PlutusData,
  PlutusList,
} from "@emurgo/cardano-serialization-lib-nodejs-gc";
import type { MerkleTreeConfig } from "../core/types";
import { sortBuffers } from "../lib/sort-buffers";

export type CslMerkleTreeOpts<TElement> = {
  elementToPlutusData: (element: TElement) => PlutusData;
};

export function createCslMerkleTreeConfig<TElement>(
  opts: CslMerkleTreeOpts<TElement>,
): MerkleTreeConfig<DataHash, TElement> {
  return {
    elementToNode: (element) => {
      const plutusData = opts.elementToPlutusData(element);
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
  };
}
