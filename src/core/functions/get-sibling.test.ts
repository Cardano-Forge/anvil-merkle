import { describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildTree } from "./build-tree";
import { getSibling } from "./get-sibling";

const numberConfig: MerkleTreeConfig<number, number> = {
  elementToNode: (element: number) => element,
  combineNodes: (left: number, right: number) => left + right,
  compareNodes: (left: number, right: number) => left === right,
};

describe("getSibling", () => {
  test("returns sibling for even index (left node)", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const sibling = getSibling(tree, 0);

    expect(sibling).toBe(2);
  });

  test("returns sibling for odd index (right node)", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const sibling = getSibling(tree, 1);

    expect(sibling).toBe(1);
  });

  test("returns undefined when sibling does not exist", () => {
    const elements = [1, 2, 3];
    const tree = buildTree(elements, numberConfig);

    const sibling = getSibling(tree, 2);

    expect(sibling).toBeUndefined();
  });

  test("returns siblings at different layers", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = buildTree(elements, numberConfig);

    expect(getSibling(tree, 0, 0)).toBe(2);
    expect(getSibling(tree, 1, 0)).toBe(1);

    expect(getSibling(tree, 0, 1)).toBe(7);
    expect(getSibling(tree, 1, 1)).toBe(3);

    expect(getSibling(tree, 0, 2)).toBe(26);
    expect(getSibling(tree, 1, 2)).toBe(10);
  });

  test("defaults to layer 0 when layer not specified", () => {
    const elements = [5, 10, 15, 20];
    const tree = buildTree(elements, numberConfig);

    const siblingDefault = getSibling(tree, 0);
    const siblingExplicit = getSibling(tree, 0, 0);

    expect(siblingDefault).toBe(siblingExplicit);
    expect(siblingDefault).toBe(10);
  });

  test("returns undefined for out of bounds index", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const sibling = getSibling(tree, 999, 0);

    expect(sibling).toBeUndefined();
  });

  test("works with single pair", () => {
    const elements = [100, 200];
    const tree = buildTree(elements, numberConfig);

    expect(getSibling(tree, 0, 0)).toBe(200);
    expect(getSibling(tree, 1, 0)).toBe(100);
  });

  test("all pairs have siblings at leaf level", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = buildTree(elements, numberConfig);

    for (let i = 0; i < elements.length - 1; i += 2) {
      const sibling = getSibling(tree, i, 0);
      expect(sibling).toBe(elements[i + 1]);
    }

    for (let i = 1; i < elements.length; i += 2) {
      const sibling = getSibling(tree, i, 0);
      expect(sibling).toBe(elements[i - 1]);
    }
  });

  test("returns undefined for negative index", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const sibling = getSibling(tree, -1);

    expect(sibling).toBeUndefined();
  });
});
