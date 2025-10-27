import { isErr, isOk } from "trynot";
import { assert, describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildTree } from "./build-tree";
import { getProof } from "./get-proof";

const numberConfig: MerkleTreeConfig<number, number> = {
  elementToNode: (element: number) => element,
  combineNodes: (left: number, right: number) => left + right,
  compareNodes: (left: number, right: number) => left === right,
};

describe("getProof", () => {
  test("returns empty proof for single element tree", () => {
    const elements = [42];
    const tree = buildTree(elements, numberConfig);

    const proof = getProof(tree, 42);

    expect(isOk(proof)).toBe(true);
    expect(proof).toEqual([]);
  });

  test("returns proof for two element tree - left element", () => {
    const elements = [10, 20];
    const tree = buildTree(elements, numberConfig);

    const proof = getProof(tree, 10);

    expect(isOk(proof)).toBe(true);
    expect(proof).toEqual([20]);
  });

  test("returns proof for two element tree - right element", () => {
    const elements = [10, 20];
    const tree = buildTree(elements, numberConfig);

    const proof = getProof(tree, 20);

    expect(isOk(proof)).toBe(true);
    expect(proof).toEqual([10]);
  });

  test("returns proof for four element tree", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const proof1 = getProof(tree, 1);
    expect(isOk(proof1)).toBe(true);
    expect(proof1).toEqual([2, 7]);

    const proof3 = getProof(tree, 3);
    expect(isOk(proof3)).toBe(true);
    expect(proof3).toEqual([4, 3]);
  });

  test("returns proof for eight element tree", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = buildTree(elements, numberConfig);

    const proof1 = getProof(tree, 1);
    expect(isOk(proof1)).toBe(true);
    expect(proof1).toEqual([2, 7, 26]);

    const proof5 = getProof(tree, 5);
    expect(isOk(proof5)).toBe(true);
    expect(proof5).toEqual([6, 15, 10]);
  });

  test("returns error for non-existent element", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const proof = getProof(tree, 99);

    assert(isErr(proof));
    expect(proof.message).toContain("Element not found");
  });

  test("proof length is tree height minus 1", () => {
    const testCases = [
      { elements: [1], expectedLength: 0 },
      { elements: [1, 2], expectedLength: 1 },
      { elements: [1, 2, 3, 4], expectedLength: 2 },
      { elements: [1, 2, 3, 4, 5, 6, 7, 8], expectedLength: 3 },
    ];

    for (const { elements, expectedLength } of testCases) {
      const tree = buildTree(elements, numberConfig);
      const proof = getProof(tree, elements[0]);

      assert(isOk(proof));
      expect(proof.length).toBe(expectedLength);
    }
  });

  test("proof can be obtained for all elements", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = buildTree(elements, numberConfig);

    for (const element of elements) {
      const proof = getProof(tree, element);
      expect(isOk(proof)).toBe(true);
    }
  });

  test("proof excludes siblings that don't exist for odd trees", () => {
    const elements = [1, 2, 3];
    const tree = buildTree(elements, numberConfig);

    const proof3 = getProof(tree, 3);
    assert(isOk(proof3));
    expect(proof3.length).toBe(1);
    expect(proof3).toEqual([3]);
  });
});
