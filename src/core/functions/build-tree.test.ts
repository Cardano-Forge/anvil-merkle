import { describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildTree } from "./build-tree";

const stringConfig: MerkleTreeConfig<string, string> = {
  elementToNode: (element: string) => `leaf:${element}`,
  combineNodes: (left: string, right: string) => `parent(${left},${right})`,
  compareNodes: (left: string, right: string) => left === right,
};

const numberConfig: MerkleTreeConfig<number, number> = {
  elementToNode: (element: number) => element,
  combineNodes: (left: number, right: number) => left + right,
  compareNodes: (left: number, right: number) => left === right,
};

describe("buildTree", () => {
  test("builds tree with single element", () => {
    const elements = ["a"];
    const tree = buildTree(elements, stringConfig);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(1);
    expect(tree.layers[0]).toEqual(["leaf:a"]);
  });

  test("builds tree with two elements", () => {
    const elements = ["a", "b"];
    const tree = buildTree(elements, stringConfig);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(2);
    expect(tree.layers[0]).toEqual(["leaf:a", "leaf:b"]);
    expect(tree.layers[1]).toEqual(["parent(leaf:a,leaf:b)"]);
  });

  test("builds tree with power of 2 elements (4)", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(3);

    // Layer 0: leaves
    expect(tree.layers[0]).toEqual([1, 2, 3, 4]);

    // Layer 1: pairs combined
    expect(tree.layers[1]).toEqual([3, 7]); // (1+2=3, 3+4=7)

    // Layer 2: root
    expect(tree.layers[2]).toEqual([10]); // (3+7=10)
  });

  test("builds tree with power of 2 elements (8)", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = buildTree(elements, numberConfig);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(4);
    expect(tree.layers[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(tree.layers[1]).toEqual([3, 7, 11, 15]);
    expect(tree.layers[2]).toEqual([10, 26]);
    expect(tree.layers[3]).toEqual([36]);
  });

  test("builds tree with odd number of elements (3)", () => {
    const elements = [1, 2, 3];
    const tree = buildTree(elements, numberConfig);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(3);

    // Layer 0: leaves
    expect(tree.layers[0]).toEqual([1, 2, 3]);

    // Layer 1: first pair combined, last element promoted
    expect(tree.layers[1]).toEqual([3, 3]); // (1+2=3, 3 promoted)

    // Layer 2: root
    expect(tree.layers[2]).toEqual([6]); // (3+3=6)
  });

  test("builds tree with odd number of elements (5)", () => {
    const elements = [1, 2, 3, 4, 5];
    const tree = buildTree(elements, numberConfig);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(4);
    expect(tree.layers[0]).toEqual([1, 2, 3, 4, 5]);
    expect(tree.layers[1]).toEqual([3, 7, 5]); // (1+2, 3+4, 5 promoted)
    expect(tree.layers[2]).toEqual([10, 5]); // (3+7, 5 promoted)
    expect(tree.layers[3]).toEqual([15]); // (10+5)
  });

  test("builds tree with odd number of elements (7)", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7];
    const tree = buildTree(elements, numberConfig);

    expect(tree.elements).toEqual(elements);
    expect(tree.layers.length).toBe(4);
    expect(tree.layers[0]).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(tree.layers[1]).toEqual([3, 7, 11, 7]); // (1+2, 3+4, 5+6, 7 promoted)
    expect(tree.layers[2]).toEqual([10, 18]); // (3+7, 11+7)
    expect(tree.layers[3]).toEqual([28]); // (10+18)
  });

  test("root layer always has exactly one node", () => {
    const testCases = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 31, 32, 33];

    for (const count of testCases) {
      const elements = Array.from({ length: count }, (_, i) => i + 1);
      const tree = buildTree(elements, numberConfig);

      expect(tree.layers[tree.layers.length - 1].length).toBe(1);
    }
  });

  test("preserves original elements", () => {
    const elements = ["apple", "banana", "cherry", "date"];
    const tree = buildTree(elements, stringConfig);

    expect(tree.elements).toEqual(elements);
  });

  test("config is stored in tree", () => {
    const elements = [1, 2, 3];
    const tree = buildTree(elements, numberConfig);

    expect(tree.config).toBe(numberConfig);
  });

  test("elementToNode is called for each element", () => {
    const elements = ["x", "y", "z"];
    const tree = buildTree(elements, stringConfig);

    // Verify first layer contains transformed elements
    expect(tree.layers[0][0]).toBe("leaf:x");
    expect(tree.layers[0][1]).toBe("leaf:y");
    expect(tree.layers[0][2]).toBe("leaf:z");
  });

  test("builds correct number of layers", () => {
    // For n elements, layers should be ceil(log2(n)) + 1
    expect(buildTree([1], numberConfig).layers.length).toBe(1);
    expect(buildTree([1, 2], numberConfig).layers.length).toBe(2);
    expect(buildTree([1, 2, 3], numberConfig).layers.length).toBe(3);
    expect(buildTree([1, 2, 3, 4], numberConfig).layers.length).toBe(3);
    expect(buildTree([1, 2, 3, 4, 5], numberConfig).layers.length).toBe(4);
    expect(buildTree([1, 2, 3, 4, 5, 6, 7, 8], numberConfig).layers.length).toBe(4);
    expect(buildTree([1, 2, 3, 4, 5, 6, 7, 8, 9], numberConfig).layers.length).toBe(5);
  });

  test("each layer has roughly half the nodes of previous layer", () => {
    const elements = Array.from({ length: 16 }, (_, i) => i + 1);
    const tree = buildTree(elements, numberConfig);

    for (let i = 1; i < tree.layers.length; i++) {
      const prevLayerSize = tree.layers[i - 1].length;
      const currentLayerSize = tree.layers[i].length;

      // Current layer should be ceil(prevLayer / 2)
      expect(currentLayerSize).toBe(Math.ceil(prevLayerSize / 2));
    }
  });
});
