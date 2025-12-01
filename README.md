# `@ada-anvil/merkle`

TypeScript utilities for working with Merkle trees.

## Installation

```bash
npm install @ada-anvil/merkle
```

### Optional peer dependency

If using the CSL implementation:

```bash
npm install @emurgo/cardano-serialization-lib-nodejs-gc
```

## Entry points

### `@ada-anvil/merkle`

Core functions and factory primitives. No peer dependencies.

```typescript
import {
  createMerkleTree,
  buildTree,
  getProof,
  verifyProof,
} from "@ada-anvil/merkle";
```

### `@ada-anvil/merkle/crypto`

Merkle tree implementations using `node:crypto` (Node.js only).

```typescript
import {
  createCryptoMerkleTree,
  createCryptoSerialMerkleTree,
} from "@ada-anvil/merkle/crypto";
```

### `@ada-anvil/merkle/csl`

Merkle tree implementations using `@emurgo/cardano-serialization-lib-nodejs-gc`. Requires the Emurgo library as an optional peer dependency.

```typescript
import {
  createCslMerkleTree,
  createCslSerialMerkleTree,
} from "@ada-anvil/merkle/csl";
```

## Usage

### Merkle tree (arbitrary elements)

```typescript
import { createCryptoMerkleTree } from "@ada-anvil/merkle/crypto";

// Create tree from UUIDs
const uuids = [
  "550e8400-e29b-41d4-a716-446655440000",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
];

const tree = createCryptoMerkleTree(uuids);

// Get root
const root = tree.getRoot();

// Generate proof for element
const proof = tree.getProof(uuids[1]);

// Verify proof
if (proof) {
  const isValid = tree.verifyProof(uuids[1], proof);
  console.log(isValid); // true
}

// Get leaf node
const leaf = tree.getLeaf(uuids[0]);
console.log(leaf); // { node: Buffer, index: 0 }

// Get sibling
const sibling = tree.getSibling(leaf.index);
```

### Serial Merkle tree (consecutive integers)

```typescript
import { createCryptoSerialMerkleTree } from "@ada-anvil/merkle/crypto";

// Create tree from consecutive integers
const ids = [1, 2, 3, 4, 5, 6, 7, 8];

const tree = createCryptoSerialMerkleTree(ids);

if (tree) {
  // Get root
  const root = tree.getRoot();

  // Generate range proof
  const rangeProof = tree.getRangeProof([3, 6]);

  // Verify range proof
  const isValid = tree.verifyRangeProof([3, 6], rangeProof);
  console.log(isValid); // true

  // Single element proof
  const singleProof = tree.getProof(5);
  if (singleProof) {
    console.log(tree.verifyProof(5, singleProof)); // true
  }
}
```

### Custom implementation

Use the core library to build your own Merkle tree with custom hash functions:

```typescript
import { createMerkleTree, type MerkleTreeConfig } from "@ada-anvil/merkle";

type CustomNode = { hash: string };
type CustomElement = { id: string; data: string };

const config: MerkleTreeConfig<CustomNode, CustomElement> = {
  elementToNode: (element) => ({
    hash: customHash(element.id + element.data),
  }),
  combineNodes: (left, right) => ({
    hash: customHash(left.hash + right.hash),
  }),
  compareNodes: (left, right) => left.hash === right.hash,
};

const elements = [
  { id: "1", data: "foo" },
  { id: "2", data: "bar" },
];

const tree = createMerkleTree(elements, config);
```

## API

### Tree instance methods

- `getRoot()` - Returns the root node
- `getLeaf(element)` - Returns leaf node and index for element
- `getLeaves()` - Returns all leaf nodes
- `getSibling(index, layerIndex?)` - Returns sibling node at index
- `getProof(element)` - Generates inclusion proof for element
- `verifyProof(element, proof)` - Verifies inclusion proof

### Serial tree additional methods

- `getRangeProof([start, end])` - Generates proof for range of consecutive elements
- `verifyRangeProof([start, end], proof)` - Verifies range proof
