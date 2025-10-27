import { assert, isOk } from "trynot";
import { describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildSerialTree } from "./build-serial-tree";
import { getRangeProof } from "./get-range-proof";

const numberConfig: MerkleTreeConfig<number, number> = {
  elementToNode: (element: number) => element,
  combineNodes: (left: number, right: number) => left + right,
  compareNodes: (left: number, right: number) => left === right,
};

describe("getRangeProof", () => {
  test("returns proof for range covering entire tree", () => {
    const elements = [1, 2, 3, 4];
    const result = buildSerialTree(elements, numberConfig);
    assert(isOk(result));

    const [leftProof, rightProof] = getRangeProof(result, [1, 4]);

    expect(leftProof).toEqual([]);
    expect(rightProof).toEqual([]);
  });

  test("returns proof for middle range", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const result = buildSerialTree(elements, numberConfig);
    assert(isOk(result));

    const [leftProof, rightProof] = getRangeProof(result, [4, 9]);

    expect(leftProof).toEqual([
      [0, 3],
      [1, 3],
    ]);
    expect(rightProof).toEqual([
      [0, 10],
      [1, 23],
      [2, 58],
    ]);
  });

  test("returns proof for start range", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    assert(isOk(result));

    const [leftProof, rightProof] = getRangeProof(result, [1, 5]);

    expect(leftProof).toEqual([]);
    expect(rightProof).toEqual([
      [0, 6],
      [1, 15],
    ]);
  });

  test("returns proof for end range", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    assert(isOk(result));

    const [leftProof, rightProof] = getRangeProof(result, [6, 8]);

    expect(leftProof).toEqual([
      [0, 5],
      [2, 10],
    ]);
    expect(rightProof).toEqual([]);
  });

  test("returns proof for odd tree", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = buildSerialTree(elements, numberConfig);
    assert(isOk(result));

    const [leftProof, rightProof] = getRangeProof(result, [6, 8]);

    expect(leftProof).toEqual([
      [0, 5],
      [2, 10],
    ]);
    expect(rightProof).toEqual([[3, 9]]);
  });
});
