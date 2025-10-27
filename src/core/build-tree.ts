import type { MerkleTree, MerkleTreeConfig } from "./types";

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
