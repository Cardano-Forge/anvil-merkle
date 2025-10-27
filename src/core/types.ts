export type MerkleTreeConfig<TNode, TElement> = {
  elementToNode(element: TElement): TNode;
  combineNodes(left: TNode, right: TNode): TNode;
  compareNodes(left: TNode, right: TNode): boolean;
};

export type MerkleTree<TNode, TElement> = {
  readonly config: MerkleTreeConfig<TNode, TElement>;
  readonly elements: readonly TElement[];
  readonly layers: readonly (readonly TNode[])[];
};

export type LayerIndex = number;

export type SerialProof<TNode> = [LayerIndex, TNode];

export type SerialProofs<TNode> = [
  /** Left side proof */
  SerialProof<TNode>[],
  /** Right side proof */
  SerialProof<TNode>[],
];

export type SerialMerkleTree<TNode> = MerkleTree<TNode, number>;

export type Range = [number, number];
