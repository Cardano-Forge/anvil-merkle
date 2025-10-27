import { faker } from "@faker-js/faker";
import { unwrap } from "trynot";
import { assert, expect, test } from "vitest";
import { CryptoMerkleTree } from "./tree";

test("CryptoMerkleTree validation", () => {
  faker.seed(123);
  const elements = Array.from({ length: 10 }, () => faker.string.nanoid({ min: 5, max: 12 }));
  const tree = new CryptoMerkleTree(elements);

  const otherElement = faker.string.nanoid({ min: 5, max: 12 });

  // Expect a single root node
  expect(tree.layers.at(-1)?.length).toBe(1);

  // Expect number of leaves to match number of elements
  expect(tree.layers.at(0)?.length).toBe(elements.length);

  expect(tree.getProof(otherElement)).toBeInstanceOf(Error);

  expect(tree.verifyProof(otherElement, [])).toBeInstanceOf(Error);
  expect(tree.verifyProof(elements[0], [])).toBe(false);

  for (const element of elements) {
    const proof = unwrap(tree.getProof(element));
    expect(tree.verifyProof(element, proof)).toBe(true);
  }

  for (let i = 0; i < elements.length - 1; i += 2) {
    const leftElement = elements[i];
    const leftLeaf = tree.getLeaf(leftElement);
    assert(leftLeaf);

    const rightElement = elements[i + 1];
    const rightLeaf = tree.getLeaf(rightElement);
    assert(rightLeaf);

    expect(tree.getSibling(leftLeaf.index)).toBe(rightLeaf.node);
    expect(tree.getSibling(rightLeaf.index)).toBe(leftLeaf.node);
  }
});
