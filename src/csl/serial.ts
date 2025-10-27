import {
  BigInt as CslBigInt,
  type DataHash,
  PlutusData,
} from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { SerialMerkleTree } from "../serial";
import { createCslMerkleTreeConfig } from "./config";

export class CslSerialMerkleTree extends SerialMerkleTree<DataHash> {
  constructor(elements: number[]) {
    super(
      elements,
      createCslMerkleTreeConfig({
        elementToPlutusData: (element) => {
          const int = CslBigInt.from_str(element.toString());
          return PlutusData.new_integer(int);
        },
      }),
    );
  }
}
