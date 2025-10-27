import { createHash } from "node:crypto";
import { faker } from "@faker-js/faker";
import { isOk } from "trynot";
import { assert, describe, expect, test } from "vitest";
import {
  createCryptoMerkleTree,
  createCryptoMerkleTreeConfig,
  createCryptoSerialMerkleTree,
} from "./crypto";

describe("createCryptoMerkleTreeConfig", () => {
  test("elementToNode hashes elements to Buffer using SHA256", () => {
    const config = createCryptoMerkleTreeConfig<string>();

    const element = "test-element";
    const node = config.elementToNode(element);

    expect(node).toBeInstanceOf(Buffer);

    const expectedHash = createHash("sha256").update(element).digest();
    expect(node.equals(expectedHash)).toBe(true);
  });

  test("elementToNode produces different hashes for different elements", () => {
    const config = createCryptoMerkleTreeConfig<string>();

    const node1 = config.elementToNode("element1");
    const node2 = config.elementToNode("element2");

    expect(node1.equals(node2)).toBe(false);
  });

  test("elementToNode produces same hash for same element", () => {
    const config = createCryptoMerkleTreeConfig<string>();

    const node1 = config.elementToNode("same");
    const node2 = config.elementToNode("same");

    expect(node1.equals(node2)).toBe(true);
  });

  test("combineNodes combines two buffers with SHA256", () => {
    const config = createCryptoMerkleTreeConfig<string>();

    const left = Buffer.from("left");
    const right = Buffer.from("right");

    const combined = config.combineNodes(left, right);

    expect(combined).toBeInstanceOf(Buffer);
    expect(combined.length).toBe(32); // SHA256 produces 32 bytes
  });

  test("combineNodes sorts buffers before hashing", () => {
    const config = createCryptoMerkleTreeConfig<string>();

    const smaller = Buffer.from([1, 2, 3]);
    const larger = Buffer.from([4, 5, 6]);

    const combined1 = config.combineNodes(smaller, larger);
    const combined2 = config.combineNodes(larger, smaller);

    expect(combined1.equals(combined2)).toBe(true);
  });

  test("combineNodes produces deterministic results", () => {
    const config = createCryptoMerkleTreeConfig<string>();

    const left = Buffer.from("deterministic-left");
    const right = Buffer.from("deterministic-right");

    const result1 = config.combineNodes(left, right);
    const result2 = config.combineNodes(left, right);

    expect(result1.equals(result2)).toBe(true);
  });

  test("compareNodes returns true for equal buffers", () => {
    const config = createCryptoMerkleTreeConfig<string>();

    const buffer1 = Buffer.from("same-content");
    const buffer2 = Buffer.from("same-content");

    expect(config.compareNodes(buffer1, buffer2)).toBe(true);
  });

  test("compareNodes returns false for different buffers", () => {
    const config = createCryptoMerkleTreeConfig<string>();

    const buffer1 = Buffer.from("content1");
    const buffer2 = Buffer.from("content2");

    expect(config.compareNodes(buffer1, buffer2)).toBe(false);
  });

  test("works with numeric elements", () => {
    const config = createCryptoMerkleTreeConfig<number>();

    const node1 = config.elementToNode(123);
    const node2 = config.elementToNode(456);

    expect(node1).toBeInstanceOf(Buffer);
    expect(node2).toBeInstanceOf(Buffer);
    expect(node1.equals(node2)).toBe(false);
  });

  test("works with stringified object elements", () => {
    const config = createCryptoMerkleTreeConfig<string>();

    const obj1 = JSON.stringify({ id: 1, name: "Alice" });
    const obj2 = JSON.stringify({ id: 2, name: "Bob" });

    const node1 = config.elementToNode(obj1);
    const node2 = config.elementToNode(obj2);

    expect(node1).toBeInstanceOf(Buffer);
    expect(node2).toBeInstanceOf(Buffer);
    expect(node1.equals(node2)).toBe(false);
  });
});

describe("createCryptoMerkleTree", () => {
  test("creates tree with single element", () => {
    const elements = ["single"];
    const tree = createCryptoMerkleTree(elements);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(1);
    expect(tree.layers[0].length).toBe(1);
  });

  test("creates tree with multiple string elements", () => {
    faker.seed(456);
    const elements = Array.from({ length: 8 }, () => faker.string.nanoid());
    const tree = createCryptoMerkleTree(elements);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers[0].length).toBe(8);
    expect(tree.layers.at(-1)?.length).toBe(1);

    for (const node of tree.layers[0]) {
      expect(node).toBeInstanceOf(Buffer);
    }
  });

  test("creates tree with numeric elements", () => {
    const elements = [100, 200, 300, 400];
    const tree = createCryptoMerkleTree(elements);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.at(-1)?.length).toBe(1);
  });

  test("getProof works with crypto tree", () => {
    faker.seed(789);
    const elements = Array.from({ length: 6 }, () => faker.string.nanoid());
    const tree = createCryptoMerkleTree(elements);

    for (const element of elements) {
      const proof = tree.getProof(element);
      assert(isOk(proof));
      expect(Array.isArray(proof)).toBe(true);
    }
  });

  test("verifyProof works with crypto tree", () => {
    faker.seed(101112);
    const elements = Array.from({ length: 10 }, () => faker.string.nanoid());
    const tree = createCryptoMerkleTree(elements);

    for (const element of elements) {
      const proof = tree.getProof(element);
      assert(isOk(proof));
      expect(tree.verifyProof(element, proof)).toBe(true);
    }
  });

  test("verifyProof rejects invalid element", () => {
    const elements = ["a", "b", "c", "d"];
    const tree = createCryptoMerkleTree(elements);

    expect(tree.verifyProof("invalid", [])).toBe(false);
  });

  test("getSibling works with crypto tree", () => {
    const elements = ["w", "x", "y", "z"];
    const tree = createCryptoMerkleTree(elements);

    const leaf0 = tree.getLeaf(elements[0]);
    const leaf1 = tree.getLeaf(elements[1]);
    assert(leaf0);
    assert(leaf1);

    expect(tree.getSibling(leaf0.index)).toBe(leaf1.node);
    expect(tree.getSibling(leaf1.index)).toBe(leaf0.node);
  });

  test("all nodes are unique within each layer in large tree (10k elements)", () => {
    faker.seed(999);
    const elements = Array.from({ length: 10000 }, () => faker.string.nanoid({ min: 8, max: 16 }));
    const tree = createCryptoMerkleTree(elements);

    for (let layerIndex = 0; layerIndex < tree.layers.length; layerIndex++) {
      const layer = tree.layers[layerIndex];
      const layerNodes = new Set<string>();

      for (const node of layer) {
        const hex = node.toString("hex");
        assert(!layerNodes.has(hex), `Duplicate node found in layer ${layerIndex}: ${hex}`);
        layerNodes.add(hex);
      }

      expect(layerNodes.size).toBe(layer.length);
    }

    expect(tree.layers[0].length).toBe(10000);
    expect(tree.layers.at(-1)?.length).toBe(1);
  });

  test("all nodes are unique across all layers except promoted nodes (10k elements)", () => {
    faker.seed(777);
    const elements = Array.from({ length: 10000 }, () => faker.string.nanoid({ min: 8, max: 16 }));
    const tree = createCryptoMerkleTree(elements);

    // Track all nodes with their layer and position
    const nodeOccurrences = new Map<string, Array<{ layer: number; position: number }>>();

    for (let layerIndex = 0; layerIndex < tree.layers.length; layerIndex++) {
      const layer = tree.layers[layerIndex];
      for (let position = 0; position < layer.length; position++) {
        const hex = layer[position].toString("hex");
        if (!nodeOccurrences.has(hex)) {
          nodeOccurrences.set(hex, []);
        }
        nodeOccurrences.get(hex)?.push({ layer: layerIndex, position });
      }
    }

    // Check that any duplicate nodes are only promoted nodes
    for (const [hash, occurrences] of nodeOccurrences.entries()) {
      if (occurrences.length > 1) {
        // This node appears in multiple layers - verify it's a promoted node
        for (let i = 0; i < occurrences.length - 1; i++) {
          const current = occurrences[i];
          const next = occurrences[i + 1];

          // Verify consecutive layers
          assert(
            next.layer === current.layer + 1,
            `Node ${hash} appears in non-consecutive layers ${current.layer} and ${next.layer}`,
          );

          // Verify it was the last node in the current layer (odd position)
          assert(
            current.position === tree.layers[current.layer].length - 1,
            `Node ${hash} in layer ${current.layer} is not at the end (position ${current.position} of ${tree.layers[current.layer].length})`,
          );

          // Verify the layer had an odd number of nodes
          assert(
            tree.layers[current.layer].length % 2 === 1,
            `Node ${hash} promoted from layer ${current.layer} which has even length ${tree.layers[current.layer].length}`,
          );
        }
      }
    }

    // Verify we have a reasonable tree structure
    expect(tree.layers[0].length).toBe(10000);
    expect(tree.layers.at(-1)?.length).toBe(1);
  });
});

describe("createCryptoSerialMerkleTree", () => {
  test("creates serial tree with consecutive numeric elements", () => {
    const elements = [1, 2, 3, 4];
    const tree = createCryptoSerialMerkleTree(elements);

    assert(isOk(tree));
    expect(tree.elements).toEqual(elements);
    expect(tree.layers.at(-1)?.length).toBe(1);
  });

  test("serial tree produces consistent range proofs", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = createCryptoSerialMerkleTree(elements);

    assert(isOk(tree));

    const rangeProof = tree.getRangeProof([1, 8]);
    expect(tree.verifyRangeProof([1, 8], rangeProof)).toBe(true);
  });

  test("serial tree handles partial range proofs", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = createCryptoSerialMerkleTree(elements);

    assert(isOk(tree));

    const rangeProof = tree.getRangeProof([3, 6]);
    expect(tree.verifyRangeProof([3, 6], rangeProof)).toBe(true);
  });

  test("serial tree handles single element", () => {
    const elements = [1];
    const tree = createCryptoSerialMerkleTree(elements);

    assert(isOk(tree));
    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(1);

    const rangeProof = tree.getRangeProof([1, 1]);
    expect(tree.verifyRangeProof([1, 1], rangeProof)).toBe(true);
  });

  test("returns error for non-consecutive elements", () => {
    const elements = [1, 2, 4, 5];
    const tree = createCryptoSerialMerkleTree(elements);

    assert(isOk(tree) === false);
  });
});
