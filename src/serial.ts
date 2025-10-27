import { isErr, isOk, type Result } from "trynot";
import { MerkleTree, type MerkleTreeConfig } from "./tree";

export type LayerIndex = number;

export type SerialProof<TNode> = [LayerIndex, TNode];

export class SerialMerkleTree<TNode> extends MerkleTree<TNode, number> {
  constructor(elements: number[], config: MerkleTreeConfig<TNode, number>) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (Math.abs(element) !== i + 1) {
        throw new Error(
          "Serial merkle tree elements must contain only consecutive integers starting from 1. Sign of element can be negative",
        );
      }
    }

    super(elements, config);
  }

  static fromLength<TNode>(
    length: number,
    config: MerkleTreeConfig<TNode, number>,
  ): SerialMerkleTree<TNode> {
    const elements = Array.from({ length }, (_, i) => i + 1);
    return new SerialMerkleTree(elements, config);
  }

  getRangeProof(range: [number, number]): [SerialProof<TNode>[], SerialProof<TNode>[]] {
    const [start, end] = range;

    const leftProof: SerialProof<TNode>[] = [];

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

    const rightProof: SerialProof<TNode>[] = [];

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
    proofs: [SerialProof<TNode>[], SerialProof<TNode>[]],
  ): boolean {
    const [start, end] = range;

    const leftProof = [...proofs[0]];
    const rightProof = [...proofs[1]];

    const leaves: TNode[] = [];
    for (let i = start; i <= end; i++) {
      const leaf = this.getLeaf(i);
      if (!leaf) {
        return false;
      }
      leaves.push(leaf.node);
    }

    const extendLayer = (layer: TNode[]): Result<TNode[]> => {
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
      const nextLayer: TNode[] = [];
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
