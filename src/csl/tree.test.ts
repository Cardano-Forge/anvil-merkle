import { BigInt as CslBigInt, PlutusData } from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { unwrap } from "trynot";
import { assert, expect, test } from "vitest";
import { CslMerkleTree } from "./tree";

test("CslMerkleTree with number elements", () => {
  const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const tree = new CslMerkleTree<number>(elements, {
    elementToPlutusData: (element) => {
      const int = CslBigInt.from_str(element.toString());
      return PlutusData.new_integer(int);
    },
  });

  // Expect a single root node
  expect(tree.layers.at(-1)?.length).toBe(1);

  // Expect number of leaves to match number of elements
  expect(tree.layers.at(0)?.length).toBe(elements.length);

  expect(tree.root.to_hex()).toBe(
    "a78645409305a44fa8eed86c45cf2626d5fc464229abfe14ee39b963bc58e665",
  );

  expect(tree.getProof(-1)).toBeInstanceOf(Error);
  expect(tree.getProof(11)).toBeInstanceOf(Error);

  expect(tree.verifyProof(-1, [])).toBe(false);
  expect(tree.verifyProof(11, [])).toBe(false);
  expect(tree.verifyProof(10, [])).toBe(false);

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
