import { isOk } from "trynot";
import { describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildTree } from "./build-tree";
import { getProof } from "./get-proof";
import { verifyProof } from "./verify-proof";

const numberConfig: MerkleTreeConfig<number, number> = {
  elementToNode: (element: number) => element,
  combineNodes: (left: number, right: number) => left + right,
  compareNodes: (left: number, right: number) => left === right,
};

describe("verifyProof", () => {
  test("verifies valid proof for single element tree", () => {
    const elements = [42];
    const tree = buildTree(elements, numberConfig);

    const result = verifyProof(tree, 42, []);

    expect(result).toBe(true);
  });

  test("verifies valid proof for two element tree", () => {
    const elements = [10, 20];
    const tree = buildTree(elements, numberConfig);

    const proof = getProof(tree, 10);
    expect(isOk(proof)).toBe(true);

    if (isOk(proof)) {
      const result = verifyProof(tree, 10, proof);
      expect(result).toBe(true);
    }
  });

  test("verifies valid proofs for all elements in four element tree", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    for (const element of elements) {
      const proof = getProof(tree, element);
      expect(isOk(proof)).toBe(true);

      if (isOk(proof)) {
        const result = verifyProof(tree, element, proof);
        expect(result).toBe(true);
      }
    }
  });

  test("verifies valid proofs for all elements in eight element tree", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = buildTree(elements, numberConfig);

    for (const element of elements) {
      const proof = getProof(tree, element);
      expect(isOk(proof)).toBe(true);

      if (isOk(proof)) {
        const result = verifyProof(tree, element, proof);
        expect(result).toBe(true);
      }
    }
  });

  test("rejects proof for non-existent element", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const result = verifyProof(tree, 99, [2, 7]);

    expect(result).toBe(false);
  });

  test("rejects invalid proof for valid element", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const result = verifyProof(tree, 1, [99, 99]);

    expect(result).toBe(false);
  });

  test("rejects empty proof for multi-element tree", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const result = verifyProof(tree, 1, []);

    expect(result).toBe(false);
  });

  test("rejects proof with wrong length", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const resultShort = verifyProof(tree, 1, [2]);
    expect(resultShort).toBe(false);

    const resultLong = verifyProof(tree, 1, [2, 7, 10, 999]);
    expect(resultLong).toBe(false);
  });

  test("rejects proof for element from different tree", () => {
    const tree1 = buildTree([1, 2, 3, 4], numberConfig);
    const tree2 = buildTree([5, 6, 7, 8], numberConfig);

    const proof = getProof(tree1, 1);
    expect(isOk(proof)).toBe(true);

    if (isOk(proof)) {
      const result = verifyProof(tree2, 5, proof);
      expect(result).toBe(false);
    }
  });

  test("verifies proofs for odd number of elements", () => {
    const elements = [1, 2, 3, 4, 5];
    const tree = buildTree(elements, numberConfig);

    for (const element of elements) {
      const proof = getProof(tree, element);
      expect(isOk(proof)).toBe(true);

      if (isOk(proof)) {
        const result = verifyProof(tree, element, proof);
        expect(result).toBe(true);
      }
    }
  });

  test("verifies proofs for large tree", () => {
    const elements = Array.from({ length: 16 }, (_, i) => i + 1);
    const tree = buildTree(elements, numberConfig);

    const testElements = [1, 5, 10, 16];

    for (const element of testElements) {
      const proof = getProof(tree, element);
      expect(isOk(proof)).toBe(true);

      if (isOk(proof)) {
        const result = verifyProof(tree, element, proof);
        expect(result).toBe(true);
      }
    }
  });

  test("rejects tampered proof", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const tree = buildTree(elements, numberConfig);

    const proof = getProof(tree, 1);
    expect(isOk(proof)).toBe(true);

    if (isOk(proof)) {
      const tamperedProof = [...proof];
      tamperedProof[0] = tamperedProof[0] + 1;

      const result = verifyProof(tree, 1, tamperedProof);
      expect(result).toBe(false);
    }
  });

  test("verifies proof matches root", () => {
    const elements = [1, 2, 3, 4];
    const tree = buildTree(elements, numberConfig);

    const proof = getProof(tree, 1);
    expect(isOk(proof)).toBe(true);

    if (isOk(proof)) {
      let node = 1;
      for (const sibling of proof) {
        node = node + sibling;
      }
      expect(node).toBe(10);
      expect(verifyProof(tree, 1, proof)).toBe(true);
    }
  });
});
