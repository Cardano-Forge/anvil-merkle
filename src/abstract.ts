import type { Result } from "trynot";

export type MerkleTreeConfig<TNode, TElement> = {
  elementToNode(element: TElement): TNode;
  getLeaf(element: TElement): { node: TNode; index: number } | undefined;
  combineNodes(left: TNode, right: TNode): TNode;
  compareNodes(left: TNode, right: TNode): boolean;
};

export abstract class MerkleTree<TNode, TElement> {
  public readonly config: MerkleTreeConfig<TNode, TElement>;
  public readonly elements: TElement[];
  public readonly layers: TNode[][];

  constructor(elements: TElement[], config: MerkleTreeConfig<TNode, TElement>) {
    this.elements = elements;
    this.config = config;

    const leaves = elements.map((element) => this.config.elementToNode(element));

    this.layers = [leaves];
    while (this.layers[this.layers.length - 1].length > 1) {
      const newLayer = [];

      for (let i = 0; i < this.layers[this.layers.length - 1].length; i += 2) {
        const left = this.layers[this.layers.length - 1][i];
        if (i + 1 >= this.layers[this.layers.length - 1].length) {
          newLayer.push(left);
          continue;
        }
        const right = this.layers[this.layers.length - 1][i + 1];
        const combined = this.config.combineNodes(left, right);
        newLayer.push(combined);
      }

      this.layers.push(newLayer);
    }
  }

  get leaves(): TNode[] {
    return this.layers[0];
  }

  get root(): TNode {
    return this.layers[this.layers.length - 1][0];
  }

  getSibling(index: number, layerIndex = 0): TNode | undefined {
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
    return this.layers[layerIndex][siblingIndex] ?? undefined;
  }

  getProof(element: TElement): Result<TNode[]> {
    const leaf = this.config.getLeaf(element);
    if (!leaf) {
      return new Error("Element not found");
    }
    let currentIndex = leaf.index;
    const proof: TNode[] = [];
    for (let layerIndex = 0; layerIndex < this.layers.length - 1; layerIndex++) {
      const sibling = this.getSibling(currentIndex, layerIndex);
      if (sibling) {
        proof.push(sibling);
      }
      currentIndex = Math.floor(currentIndex / 2);
    }
    return proof;
  }

  verifyProof(element: TElement, proof: TNode[]): Result<boolean> {
    const leaf = this.config.getLeaf(element);
    if (!leaf) {
      return new Error("Element not found");
    }
    let node = leaf.node;
    for (const sibling of proof) {
      node = this.config.combineNodes(node, sibling);
    }
    return this.config.compareNodes(node, this.root);
  }
}
