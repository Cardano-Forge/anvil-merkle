import {
  BigInt as CslBigInt,
  type DataHash,
  PlutusData,
} from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { isErr, isOk, type Result } from "trynot";
import { CslMerkleTree } from "./tree";

type LayerIndex = number;

type Proof<TNode> = [LayerIndex, TNode];

export class CslSerialMerkleTree extends CslMerkleTree<number> {
  constructor(elements: number[]) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (Math.abs(element) !== i + 1) {
        throw new Error(
          "Serial merkle tree elements must contain only consecutive integers starting from 1. Sign of element can be negative",
        );
      }
    }

    super(elements, {
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });
  }

  static fromLength(length: number): CslSerialMerkleTree {
    const elements = Array.from({ length }, (_, i) => i + 1);
    return new CslSerialMerkleTree(elements);
  }

  getRangeProof(range: [number, number]): [Proof<DataHash>[], Proof<DataHash>[]] {
    const [start, end] = range;

    const leftProof: Proof<DataHash>[] = [];

    let startIdx = start - 1;
    if (start % 2 === 0) {
      startIdx = startIdx - 1;
      const leafHash = this.leaves[startIdx];
      if (leafHash) {
        leftProof.push([0, leafHash]);
      }
    }

    let idx = startIdx;
    for (let layerIdx = 1; layerIdx < this.layers.length - 1; layerIdx++) {
      idx = Math.floor(idx / 2);
      const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
      const hash = this.layers[layerIdx][siblingIdx];
      const leafIdx = siblingIdx * 2 ** layerIdx;
      if (hash && leafIdx < startIdx) {
        leftProof.push([layerIdx, hash]);
      }
    }

    const rightProof: Proof<DataHash>[] = [];

    let endIdx = end - 1;
    if (end % 2 === 1) {
      endIdx = endIdx + 1;
      const leafHash = this.leaves[endIdx];
      if (leafHash) {
        rightProof.push([0, leafHash]);
      }
    }

    idx = endIdx;
    for (let layerIdx = 1; layerIdx < this.layers.length - 1; layerIdx++) {
      idx = Math.floor(idx / 2);
      const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
      const hash = this.layers[layerIdx][siblingIdx];
      const leafIdx = siblingIdx * 2 ** layerIdx;
      if (hash && leafIdx > endIdx) {
        rightProof.push([layerIdx, hash]);
      }
    }

    return [leftProof, rightProof];
  }

  verifyRangeProof(
    range: [number, number],
    proofs: [Proof<DataHash>[], Proof<DataHash>[]],
  ): boolean {
    const [start, end] = range;

    const leftProof = [...proofs[0]];
    const rightProof = [...proofs[1]];

    const leaves: DataHash[] = [];
    for (let i = start; i <= end; i++) {
      const leaf = this.getLeaf(i);
      if (!leaf) {
        return false;
      }
      leaves.push(leaf.node);
    }

    const extendLayer = (layer: DataHash[]): Result<DataHash[]> => {
      if (leftProof[0]?.[0] === layerIdx) {
        const proof = leftProof.shift();
        if (!proof) {
          return new Error("Left proof not found");
        }
        const [, node] = proof;
        layer.unshift(node);
      }
      if (rightProof[0]?.[0] === layerIdx) {
        const proof = rightProof.shift();
        if (!proof) {
          return new Error("Right proof not found");
        }
        const [, node] = proof;
        layer.push(node);
      }
      return layer;
    };

    let layerIdx = 0;
    let layer = extendLayer([...leaves]);

    while (isOk(layer) && layer.length > 1) {
      const nextLayer: DataHash[] = [];
      for (let i = 0; i < layer.length; i += 2) {
        const left = layer[i];
        const right = layer[i + 1];
        if (right) {
          nextLayer.push(this.config.combineNodes(left, right));
        } else {
          nextLayer.push(left);
        }
      }
      layer = nextLayer;
      layerIdx++;
      layer = extendLayer(layer);
    }

    if (isErr(layer)) {
      return false;
    }

    const computedRoot = layer[0];
    return this.config.compareNodes(computedRoot, this.root);
  }
}
