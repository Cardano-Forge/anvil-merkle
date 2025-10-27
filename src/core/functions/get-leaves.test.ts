import { describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildTree } from "./build-tree";
import { getLeaves } from "./get-leaves";

const numberConfig: MerkleTreeConfig<string, number> = {
  elementToNode: (element) => String(element),
  combineNodes: (left, right) => `(${[left, right].toSorted().join(",")})`,
  compareNodes: (left, right) => left === right,
};

describe("getLeaves", () => {
  test("returns all leaves for a simple tree", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const leaves = getLeaves(tree);

    expect(leaves).toEqual(["1", "2", "3", "4"]);
  });

  test("returns single leaf for single element tree", () => {
    const elements = [42];
    const tree = buildTree(elements, numberConfig);

    const leaves = getLeaves(tree);

    expect(leaves).toEqual(["42"]);
  });

  test("returns all leaves for odd number of elements", () => {
    const elements = [1, 2, 3, 4, 5];
    const tree = buildTree(elements, numberConfig);

    const leaves = getLeaves(tree);

    expect(leaves).toEqual(["1", "2", "3", "4", "5"]);
  });

  test("returns leaves that match first layer", () => {
    const elements = [10, 20, 30, 40, 50, 60, 70, 80];
    const tree = buildTree(elements, numberConfig);

    const leaves = getLeaves(tree);

    expect(leaves).toBe(tree.layers[0]);
    expect(leaves.length).toBe(8);
  });

  test("returns empty array for tree with no elements", () => {
    const elements: number[] = [];
    const tree = buildTree(elements, numberConfig);

    const leaves = getLeaves(tree);

    expect(leaves).toEqual([]);
  });

  test("leaves count matches elements count", () => {
    const testCases = [1, 2, 3, 4, 5, 7, 8, 15, 16];

    for (const count of testCases) {
      const elements = Array.from({ length: count }, (_, i) => i + 1);
      const tree = buildTree(elements, numberConfig);

      const leaves = getLeaves(tree);

      expect(leaves.length).toBe(count);
    }
  });
});
