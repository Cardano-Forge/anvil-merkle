import { isErr, isOk, type Result } from "trynot";
import type { MerkleTree, MerkleTreeConfig, SerialMerkleTree, SerialProof } from "./types";

export function buildTree<TNode, TElement>(
  elements: TElement[],
  config: MerkleTreeConfig<TNode, TElement>,
): MerkleTree<TNode, TElement> {
  const leaves = elements.map((element) => config.elementToNode(element));

  const layers: TNode[][] = [leaves];
  while (layers[layers.length - 1].length > 1) {
    const newLayer: TNode[] = [];

    for (let i = 0; i < layers[layers.length - 1].length; i += 2) {
      const left = layers[layers.length - 1][i];
      if (i + 1 >= layers[layers.length - 1].length) {
        newLayer.push(left);
        continue;
      }
      const right = layers[layers.length - 1][i + 1];
      const combined = config.combineNodes(left, right);
      newLayer.push(combined);
    }

    layers.push(newLayer);
  }

  return {
    config,
    elements,
    layers,
  };
}

export function buildSerialTree<TNode>(
  elements: number[],
  config: MerkleTreeConfig<TNode, number>,
): Result<SerialMerkleTree<TNode>> {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (Math.abs(element) !== i + 1) {
      return new Error(
        "Serial merkle tree elements must contain only consecutive integers starting from 1. Sign of element can be negative",
      );
    }
  }

  return buildTree(elements, config);
}

export function buildSerialTreeFromLength<TNode>(
  length: number,
  config: MerkleTreeConfig<TNode, number>,
): SerialMerkleTree<TNode> {
  const elements = Array.from({ length }, (_, i) => i + 1);
  return buildTree(elements, config);
}

export function getLeaves<TNode, TElement>(tree: MerkleTree<TNode, TElement>): readonly TNode[] {
  return tree.layers[0];
}

export function getRoot<TNode, TElement>(tree: MerkleTree<TNode, TElement>): TNode {
  return tree.layers[tree.layers.length - 1][0];
}

export function getLeaf<TNode, TElement>(
  tree: MerkleTree<TNode, TElement>,
  element: TElement,
): { node: TNode; index: number } | undefined {
  const index = tree.elements.indexOf(element);
  if (index === -1) {
    return undefined;
  }
  const node = tree.layers[0][index];
  return { node, index };
}

/**
 * Gets the sibling of a node at a given index and layer.
 */
export function getSibling<TNode, TElement>(
  tree: MerkleTree<TNode, TElement>,
  index: number,
  layerIndex = 0,
): TNode | undefined {
  const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
  return tree.layers[layerIndex][siblingIndex] ?? undefined;
}

export function getProof<TNode, TElement>(
  tree: MerkleTree<TNode, TElement>,
  element: TElement,
): Result<TNode[]> {
  const leaf = getLeaf(tree, element);
  if (!leaf) {
    return new Error("Element not found");
  }
  let currentIndex = leaf.index;
  const proof: TNode[] = [];
  for (let layerIndex = 0; layerIndex < tree.layers.length - 1; layerIndex++) {
    const sibling = getSibling(tree, currentIndex, layerIndex);
    if (sibling) {
      proof.push(sibling);
    }
    currentIndex = Math.floor(currentIndex / 2);
  }
  return proof;
}

export function verifyProof<TNode, TElement>(
  tree: MerkleTree<TNode, TElement>,
  element: TElement,
  proof: TNode[],
): boolean {
  const leaf = getLeaf(tree, element);
  if (!leaf) {
    return false;
  }
  let node = leaf.node;
  for (const sibling of proof) {
    node = tree.config.combineNodes(node, sibling);
  }
  return tree.config.compareNodes(node, getRoot(tree));
}

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

export function verifyRangeProof<TNode>(
  tree: SerialMerkleTree<TNode>,
  range: [number, number],
  proofs: [SerialProof<TNode>[], SerialProof<TNode>[]],
): boolean {
  const [start, end] = range;

  const leftProof = [...proofs[0]];
  const rightProof = [...proofs[1]];

  const leaves: TNode[] = [];
  for (let i = start; i <= end; i++) {
    const leaf = getLeaf(tree, i);
    if (!leaf) {
      return false;
    }
    leaves.push(leaf.node);
  }

  const extendLayer = (layer: TNode[], layerIdx: number): Result<TNode[]> => {
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
  let layer = extendLayer([...leaves], layerIdx);

  while (isOk(layer) && layer.length > 1) {
    const nextLayer: TNode[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1];
      if (right) {
        nextLayer.push(tree.config.combineNodes(left, right));
      } else {
        nextLayer.push(left);
      }
    }
    layer = nextLayer;
    layerIdx++;
    layer = extendLayer(layer, layerIdx);
  }

  if (isErr(layer)) {
    return false;
  }

  const computedRoot = layer[0];
  return tree.config.compareNodes(computedRoot, getRoot(tree));
}
