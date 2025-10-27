import { isOk } from "trynot";
import { describe, expect, test } from "vitest";
import type { MerkleTreeConfig } from "../types";
import { buildSerialTree } from "./build-serial-tree";
import { getRangeProof } from "./get-range-proof";
import { verifyRangeProof } from "./verify-range-proof";

const numberConfig: MerkleTreeConfig<number, number> = {
  elementToNode: (element: number) => element,
  combineNodes: (left: number, right: number) => left + right,
  compareNodes: (left: number, right: number) => left === right,
};

describe("verifyRangeProof", () => {
  test("verifies valid proof for entire range", () => {
    const elements = [1, 2, 3, 4];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const proof = getRangeProof(result, [1, 4]);
      const valid = verifyRangeProof(result, [1, 4], proof);

      expect(valid).toBe(true);
    }
  });

  test("verifies valid proof for middle range", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const proof = getRangeProof(result, [3, 6]);
      const valid = verifyRangeProof(result, [3, 6], proof);

      expect(valid).toBe(true);
    }
  });

  test("verifies valid proof for single element range", () => {
    const elements = [1, 2, 3, 4];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const proof = getRangeProof(result, [2, 2]);
      const valid = verifyRangeProof(result, [2, 2], proof);

      expect(valid).toBe(true);
    }
  });

  test("verifies valid proof for range at start", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const proof = getRangeProof(result, [1, 4]);
      const valid = verifyRangeProof(result, [1, 4], proof);

      expect(valid).toBe(true);
    }
  });

  test("verifies valid proof for range at end", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const proof = getRangeProof(result, [5, 8]);
      const valid = verifyRangeProof(result, [5, 8], proof);

      expect(valid).toBe(true);
    }
  });

  test("verifies all valid ranges in a tree", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const ranges: [number, number][] = [
        [1, 1],
        [1, 2],
        [2, 4],
        [3, 6],
        [5, 8],
        [1, 8],
        [4, 4],
        [7, 8],
      ];

      for (const range of ranges) {
        const proof = getRangeProof(result, range);
        const valid = verifyRangeProof(result, range, proof);
        expect(valid).toBe(true);
      }
    }
  });

  test("rejects tampered left proof", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const [leftProof, rightProof] = getRangeProof(result, [3, 6]);

      if (leftProof.length > 0) {
        const tamperedLeft = [...leftProof];
        tamperedLeft[0] = [tamperedLeft[0][0], tamperedLeft[0][1] + 1];

        const valid = verifyRangeProof(result, [3, 6], [tamperedLeft, rightProof]);
        expect(valid).toBe(false);
      }
    }
  });

  test("rejects tampered right proof", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const [leftProof, rightProof] = getRangeProof(result, [3, 6]);

      if (rightProof.length > 0) {
        const tamperedRight = [...rightProof];
        tamperedRight[0] = [tamperedRight[0][0], tamperedRight[0][1] + 1];

        const valid = verifyRangeProof(result, [3, 6], [leftProof, tamperedRight]);
        expect(valid).toBe(false);
      }
    }
  });

  test("rejects proof for wrong range", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const proof = getRangeProof(result, [3, 6]);

      const valid = verifyRangeProof(result, [2, 5], proof);
      expect(valid).toBe(false);
    }
  });

  test("rejects empty proof for partial range", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const valid = verifyRangeProof(result, [3, 6], [[], []]);
      expect(valid).toBe(false);
    }
  });

  test("works with power of 2 sized tree", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const proof = getRangeProof(result, [5, 12]);
      const valid = verifyRangeProof(result, [5, 12], proof);

      expect(valid).toBe(true);
    }
  });

  test("works with odd-sized tree", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const proof = getRangeProof(result, [2, 5]);
      const valid = verifyRangeProof(result, [2, 5], proof);

      expect(valid).toBe(true);
    }
  });

  test("verifies consecutive two-element ranges", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      for (let i = 1; i < elements.length; i++) {
        const proof = getRangeProof(result, [i, i + 1]);
        const valid = verifyRangeProof(result, [i, i + 1], proof);
        expect(valid).toBe(true);
      }
    }
  });

  test("rejects proof with invalid range elements", () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const proof = getRangeProof(result, [3, 6]);

      const valid = verifyRangeProof(result, [10, 15], proof);
      expect(valid).toBe(false);
    }
  });

  test("works with larger tree for comprehensive range testing", () => {
    const elements = Array.from({ length: 32 }, (_, i) => i + 1);
    const result = buildSerialTree(elements, numberConfig);
    expect(isOk(result)).toBe(true);

    if (isOk(result)) {
      const ranges: [number, number][] = [
        [1, 8],
        [9, 16],
        [17, 24],
        [25, 32],
        [10, 20],
      ];

      for (const range of ranges) {
        const proof = getRangeProof(result, range);
        const valid = verifyRangeProof(result, range, proof);
        expect(valid).toBe(true);
      }
    }
  });
});
