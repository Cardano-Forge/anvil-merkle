import { isErr, isOk } from "trynot";
import { describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildSerialTree } from "./build-serial-tree";

const numberConfig: MerkleTreeConfig<number, number> = {
  elementToNode: (element: number) => element,
  combineNodes: (left: number, right: number) => left + right,
  compareNodes: (left: number, right: number) => left === right,
};

describe("buildSerialTree", () => {
  test("builds tree with consecutive positive integers", () => {
    const elements = [1, 2, 3, 4];
    const result = buildSerialTree(elements, numberConfig);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.elements).toEqual([1, 2, 3, 4]);
      expect(result.layers[0]).toEqual([1, 2, 3, 4]);
    }
  });

  test("builds tree with single element", () => {
    const elements = [1];
    const result = buildSerialTree(elements, numberConfig);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.elements).toEqual([1]);
      expect(result.layers.length).toBe(1);
    }
  });

  test("builds tree with consecutive negative integers", () => {
    const elements = [-1, -2, -3, -4];
    const result = buildSerialTree(elements, numberConfig);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.elements).toEqual([-1, -2, -3, -4]);
      expect(result.layers[0]).toEqual([-1, -2, -3, -4]);
    }
  });

  test("builds tree with mixed positive and negative integers", () => {
    const elements = [1, -2, 3, -4, 5];
    const result = buildSerialTree(elements, numberConfig);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.elements).toEqual([1, -2, 3, -4, 5]);
    }
  });

  test("returns error for non-consecutive integers", () => {
    const elements = [1, 2, 4, 5]; // Missing 3
    const result = buildSerialTree(elements, numberConfig);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain("consecutive integers");
    }
  });

  test("returns error when starting from wrong number", () => {
    const elements = [2, 3, 4]; // Should start from 1
    const result = buildSerialTree(elements, numberConfig);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain("consecutive integers");
    }
  });

  test("returns error for out of order elements", () => {
    const elements = [1, 3, 2, 4]; // Out of order
    const result = buildSerialTree(elements, numberConfig);

    expect(isErr(result)).toBe(true);
  });

  test("returns error for duplicates", () => {
    const elements = [1, 2, 2, 3];
    const result = buildSerialTree(elements, numberConfig);

    expect(isErr(result)).toBe(true);
  });
});
