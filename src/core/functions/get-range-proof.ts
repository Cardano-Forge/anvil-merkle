import type { SerialMerkleTree, SerialProof } from "../types";

export function getRangeProof<TNode>(
  tree: SerialMerkleTree<TNode>,
  range: [number, number],
): [SerialProof<TNode>[], SerialProof<TNode>[]] {
  const [start, end] = range;

  const leftProof: SerialProof<TNode>[] = [];

  let startIdx = start - 1;
  if (start % 2 === 0) {
    startIdx = startIdx - 1;
    const leafHash = tree.layers[0][startIdx];
    if (leafHash) {
      leftProof.push([0, leafHash]);
    }
  }

  let idx = startIdx;
  for (let layerIdx = 1; layerIdx < tree.layers.length - 1; layerIdx++) {
    idx = Math.floor(idx / 2);
    const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    const hash = tree.layers[layerIdx][siblingIdx];
    const leafIdx = siblingIdx * 2 ** layerIdx;
    if (hash && leafIdx < startIdx) {
      leftProof.push([layerIdx, hash]);
    }
  }

  const rightProof: SerialProof<TNode>[] = [];

  let endIdx = end - 1;
  if (end % 2 === 1) {
    endIdx = endIdx + 1;
    const leafHash = tree.layers[0][endIdx];
    if (leafHash) {
      rightProof.push([0, leafHash]);
    }
  }

  idx = endIdx;
  for (let layerIdx = 1; layerIdx < tree.layers.length - 1; layerIdx++) {
    idx = Math.floor(idx / 2);
    const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    const hash = tree.layers[layerIdx][siblingIdx];
    const leafIdx = siblingIdx * 2 ** layerIdx;
    if (hash && leafIdx > endIdx) {
      rightProof.push([layerIdx, hash]);
    }
  }

  return [leftProof, rightProof];
}
