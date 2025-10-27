import type { DataHash } from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { MerkleTree } from "../tree";
import { type CslMerkleTreeOpts, createCslMerkleTreeConfig } from "./config";

export class CslMerkleTree<TElement> extends MerkleTree<DataHash, TElement> {
  constructor(elements: TElement[], opts: CslMerkleTreeOpts<TElement>) {
    super(elements, createCslMerkleTreeConfig(opts));
  }
}
