import { describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildTree } from "./build-tree";
import { getLeaf } from "./get-leaf";

const numberConfig: MerkleTreeConfig<number, number> = {
  elementToNode: (element: number) => element,
  combineNodes: (left: number, right: number) => left + right,
  compareNodes: (left: number, right: number) => left === right,
};

describe("getLeaf", () => {
  test("returns leaf node and index for existing element", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const leaf = getLeaf(tree, 3);

    expect(leaf).toBeDefined();
    expect(leaf?.node).toBe(3);
    expect(leaf?.index).toBe(2);
  });

  test("returns first element correctly", () => {
    const elements = [10, 20, 30];
    const tree = buildTree(elements, numberConfig);

    const leaf = getLeaf(tree, 10);

    expect(leaf).toBeDefined();
    expect(leaf?.node).toBe(10);
    expect(leaf?.index).toBe(0);
  });

  test("returns last element correctly", () => {
    const elements = [10, 20, 30, 40];
    const tree = buildTree(elements, numberConfig);

    const leaf = getLeaf(tree, 40);

    expect(leaf).toBeDefined();
    expect(leaf?.node).toBe(40);
    expect(leaf?.index).toBe(3);
  });

  test("returns undefined for non-existent element", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const leaf = getLeaf(tree, 99);

    expect(leaf).toBeUndefined();
  });

  test("returns undefined for empty tree", () => {
    const elements: number[] = [];
    const tree = buildTree(elements, numberConfig);

    const leaf = getLeaf(tree, 1);

    expect(leaf).toBeUndefined();
  });

  test("works with single element tree", () => {
    const elements = [42];
    const tree = buildTree(elements, numberConfig);

    const leaf = getLeaf(tree, 42);

    expect(leaf).toBeDefined();
    expect(leaf?.node).toBe(42);
    expect(leaf?.index).toBe(0);
  });

  test("finds all elements in larger tree", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = buildTree(elements, numberConfig);

    for (let i = 0; i < elements.length; i++) {
      const leaf = getLeaf(tree, elements[i]);
      expect(leaf).toBeDefined();
      expect(leaf?.node).toBe(elements[i]);
      expect(leaf?.index).toBe(i);
    }
  });
});
