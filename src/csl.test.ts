import {
  BigInt as CslBigInt,
  hash_plutus_data,
  PlutusData,
  PlutusList,
} from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { faker } from "@faker-js/faker";
import { isOk } from "trynot";
import { assert, describe, expect, test } from "vitest";
import { createCslMerkleTree, createCslMerkleTreeConfig, createCslSerialMerkleTree } from "./csl";

describe("createCslMerkleTreeConfig", () => {
  test("elementToNode hashes elements to DataHash using PlutusData", () => {
    const config = createCslMerkleTreeConfig<number>({
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    const element = 42;
    const node = config.elementToNode(element);

    expect(node).toBeDefined();
    expect(node.to_hex()).toBeTruthy();
  });

  test("elementToNode produces different hashes for different elements", () => {
    const config = createCslMerkleTreeConfig<number>({
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    const node1 = config.elementToNode(100);
    const node2 = config.elementToNode(200);

    expect(node1.to_hex()).not.toBe(node2.to_hex());
  });

  test("elementToNode produces same hash for same element", () => {
    const config = createCslMerkleTreeConfig<number>({
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    const node1 = config.elementToNode(42);
    const node2 = config.elementToNode(42);

    expect(node1.to_hex()).toBe(node2.to_hex());
  });

  test("combineNodes combines two DataHash using PlutusData list", () => {
    const config = createCslMerkleTreeConfig<number>({
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    const plutusData1 = PlutusData.new_integer(CslBigInt.from_str("1"));
    const plutusData2 = PlutusData.new_integer(CslBigInt.from_str("2"));

    const hash1 = hash_plutus_data(plutusData1);
    const hash2 = hash_plutus_data(plutusData2);

    const combined = config.combineNodes(hash1, hash2);

    expect(combined).toBeDefined();
    expect(combined.to_hex()).toBeTruthy();
  });

  test("combineNodes sorts hashes before combining", () => {
    const config = createCslMerkleTreeConfig<number>({
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    const hash1 = hash_plutus_data(PlutusData.new_integer(CslBigInt.from_str("1")));
    const hash2 = hash_plutus_data(PlutusData.new_integer(CslBigInt.from_str("2")));

    const combined1 = config.combineNodes(hash1, hash2);
    const combined2 = config.combineNodes(hash2, hash1);

    expect(combined1.to_hex()).toBe(combined2.to_hex());
  });

  test("combineNodes produces deterministic results", () => {
    const config = createCslMerkleTreeConfig<number>({
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    const hash1 = hash_plutus_data(PlutusData.new_integer(CslBigInt.from_str("10")));
    const hash2 = hash_plutus_data(PlutusData.new_integer(CslBigInt.from_str("20")));

    const result1 = config.combineNodes(hash1, hash2);
    const result2 = config.combineNodes(hash1, hash2);

    expect(result1.to_hex()).toBe(result2.to_hex());
  });

  test("compareNodes returns true for equal hashes", () => {
    const config = createCslMerkleTreeConfig<number>({
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    const hash1 = hash_plutus_data(PlutusData.new_integer(CslBigInt.from_str("42")));
    const hash2 = hash_plutus_data(PlutusData.new_integer(CslBigInt.from_str("42")));

    expect(config.compareNodes(hash1, hash2)).toBe(true);
  });

  test("compareNodes returns false for different hashes", () => {
    const config = createCslMerkleTreeConfig<number>({
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    const hash1 = hash_plutus_data(PlutusData.new_integer(CslBigInt.from_str("1")));
    const hash2 = hash_plutus_data(PlutusData.new_integer(CslBigInt.from_str("2")));

    expect(config.compareNodes(hash1, hash2)).toBe(false);
  });

  test("works with string elements", () => {
    const config = createCslMerkleTreeConfig<string>({
      elementToPlutusData: (element) => {
        return PlutusData.new_bytes(Buffer.from(element));
      },
    });

    const node1 = config.elementToNode("hello");
    const node2 = config.elementToNode("world");

    expect(node1.to_hex()).toBeTruthy();
    expect(node2.to_hex()).toBeTruthy();
    expect(node1.to_hex()).not.toBe(node2.to_hex());
  });

  test("works with custom object elements", () => {
    type CustomElement = { id: number; data: string };

    const config = createCslMerkleTreeConfig<CustomElement>({
      elementToPlutusData: (element) => {
        const list = PlutusList.new();
        list.add(PlutusData.new_integer(CslBigInt.from_str(element.id.toString())));
        list.add(PlutusData.new_bytes(Buffer.from(element.data)));
        return PlutusData.new_list(list);
      },
    });

    const node1 = config.elementToNode({ id: 1, data: "first" });
    const node2 = config.elementToNode({ id: 2, data: "second" });

    expect(node1.to_hex()).toBeTruthy();
    expect(node2.to_hex()).toBeTruthy();
    expect(node1.to_hex()).not.toBe(node2.to_hex());
  });
});

describe("createCslMerkleTree", () => {
  test("creates tree with single element", () => {
    const elements = [42];
    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(1);
    expect(tree.layers[0].length).toBe(1);
  });

  test("creates tree with multiple numeric elements", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    expect(tree.elements).toEqual(elements);
    expect(tree.layers[0].length).toBe(8);
    expect(tree.layers.at(-1)?.length).toBe(1);
  });

  test("creates tree with string elements", () => {
    faker.seed(111);
    const elements = Array.from({ length: 6 }, () => faker.string.nanoid());
    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        return PlutusData.new_bytes(Buffer.from(element));
      },
    });

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.at(-1)?.length).toBe(1);
  });

  test("getProof works with csl tree", () => {
    const elements = [10, 20, 30, 40, 50, 60];
    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    for (const element of elements) {
      const proof = tree.getProof(element);
      assert(isOk(proof));
      expect(Array.isArray(proof)).toBe(true);
    }
  });

  test("verifyProof works with csl tree", () => {
    const elements = [100, 200, 300, 400];
    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    for (const element of elements) {
      const proof = tree.getProof(element);
      assert(isOk(proof));
      expect(tree.verifyProof(element, proof)).toBe(true);
    }
  });

  test("verifyProof rejects invalid element", () => {
    const elements = [1, 2, 3, 4];
    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    expect(tree.verifyProof(999, [])).toBe(false);
  });

  test("getSibling works with csl tree", () => {
    const elements = [10, 20, 30, 40];
    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        const int = CslBigInt.from_str(element.toString());
        return PlutusData.new_integer(int);
      },
    });

    const leaf0 = tree.getLeaf(elements[0]);
    const leaf1 = tree.getLeaf(elements[1]);
    assert(leaf0);
    assert(leaf1);

    expect(tree.getSibling(leaf0.index)?.to_hex()).toBe(leaf1.node.to_hex());
    expect(tree.getSibling(leaf1.index)?.to_hex()).toBe(leaf0.node.to_hex());
  });

  test("works with custom object elements", () => {
    type User = { id: number; name: string };
    const elements: User[] = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
      { id: 4, name: "Dave" },
    ];

    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        const list = PlutusList.new();
        list.add(PlutusData.new_integer(CslBigInt.from_str(element.id.toString())));
        list.add(PlutusData.new_bytes(Buffer.from(element.name)));
        return PlutusData.new_list(list);
      },
    });

    expect(tree.elements).toEqual(elements);

    const proof = tree.getProof(elements[0]);
    assert(isOk(proof));
    expect(tree.verifyProof(elements[0], proof)).toBe(true);
  });

  test("all nodes are unique within each layer in large tree (10k elements)", () => {
    faker.seed(888);
    const elements = Array.from({ length: 10000 }, () => faker.string.nanoid({ min: 8, max: 16 }));
    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        return PlutusData.new_bytes(Buffer.from(element));
      },
    });

    for (let layerIndex = 0; layerIndex < tree.layers.length; layerIndex++) {
      const layer = tree.layers[layerIndex];
      const layerNodes = new Set<string>();

      for (const node of layer) {
        const hex = node.to_hex();
        assert(!layerNodes.has(hex), `Duplicate node found in layer ${layerIndex}: ${hex}`);
        layerNodes.add(hex);
      }

      expect(layerNodes.size).toBe(layer.length);
    }

    expect(tree.layers[0].length).toBe(10000);
    expect(tree.layers.at(-1)?.length).toBe(1);
  });

  test("all nodes are unique across all layers except promoted nodes (10k elements)", () => {
    faker.seed(678);
    const elements = Array.from({ length: 10000 }, () => faker.string.nanoid({ min: 8, max: 16 }));
    const tree = createCslMerkleTree(elements, {
      elementToPlutusData: (element) => {
        return PlutusData.new_bytes(Buffer.from(element));
      },
    });

    // Track all nodes with their layer and position
    const nodeOccurrences = new Map<string, Array<{ layer: number; position: number }>>();

    for (let layerIndex = 0; layerIndex < tree.layers.length; layerIndex++) {
      const layer = tree.layers[layerIndex];
      for (let position = 0; position < layer.length; position++) {
        const hex = layer[position].to_hex();
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

describe("createCslSerialMerkleTree", () => {
  test("creates serial tree with consecutive numeric elements", () => {
    const elements = [1, 2, 3, 4];
    const tree = createCslSerialMerkleTree(elements);

    assert(isOk(tree));
    expect(tree.elements).toEqual(elements);
    expect(tree.layers.at(-1)?.length).toBe(1);
  });

  test("serial tree produces consistent range proofs", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = createCslSerialMerkleTree(elements);

    assert(isOk(tree));

    const rangeProof = tree.getRangeProof([1, 8]);
    expect(tree.verifyRangeProof([1, 8], rangeProof)).toBe(true);
  });

  test("serial tree handles partial range proofs", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = createCslSerialMerkleTree(elements);

    assert(isOk(tree));

    const rangeProof = tree.getRangeProof([3, 6]);
    expect(tree.verifyRangeProof([3, 6], rangeProof)).toBe(true);
  });

  test("serial tree handles single element", () => {
    const elements = [1];
    const tree = createCslSerialMerkleTree(elements);

    assert(isOk(tree));
    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(1);

    const rangeProof = tree.getRangeProof([1, 1]);
    expect(tree.verifyRangeProof([1, 1], rangeProof)).toBe(true);
  });

  test("returns error for non-consecutive elements", () => {
    const elements = [1, 2, 4, 5];
    const tree = createCslSerialMerkleTree(elements);

    assert(isOk(tree) === false);
  });
});
