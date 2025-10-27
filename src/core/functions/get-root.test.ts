import { describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildTree } from "./build-tree";
import { getRoot } from "./get-root";

const numberConfig: MerkleTreeConfig<number, number> = {
  elementToNode: (element: number) => element,
  combineNodes: (left: number, right: number) => left + right,
  compareNodes: (left: number, right: number) => left === right,
};

describe("getRoot", () => {
  test("returns root for single element tree", () => {
    const elements = [42];
    const tree = buildTree(elements, numberConfig);

    const root = getRoot(tree);

    expect(root).toBe(42);
  });

  test("returns root for two element tree", () => {
    const elements = [10, 20];
    const tree = buildTree(elements, numberConfig);

    const root = getRoot(tree);

    expect(root).toBe(30);
  });

  test("returns correct root for power of 2 elements", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const root = getRoot(tree);

    expect(root).toBe(10);
  });

  test("returns correct root for 8 elements", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = buildTree(elements, numberConfig);

    const root = getRoot(tree);

    expect(root).toBe(36);
  });

  test("returns correct root for odd number of elements", () => {
    const elements = [1, 2, 3];
    const tree = buildTree(elements, numberConfig);

    const root = getRoot(tree);

    expect(root).toBe(6);
  });

  test("root matches last layer first element", () => {
    const elements = [5, 10, 15, 20, 25];
    const tree = buildTree(elements, numberConfig);

    const root = getRoot(tree);

    expect(root).toBe(tree.layers[tree.layers.length - 1][0]);
  });

  test("root is single value for various tree sizes", () => {
    const testCases = [1, 2, 3, 4, 5, 7, 8, 9, 15, 16, 17];

    for (const count of testCases) {
      const elements = Array.from({ length: count }, (_, i) => i + 1);
      const tree = buildTree(elements, numberConfig);

      const root = getRoot(tree);

      expect(tree.layers[tree.layers.length - 1].length).toBe(1);
      expect(root).toBeDefined();
    }
  });
});
