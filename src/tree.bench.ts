import { PlutusData } from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { faker } from "@faker-js/faker";
import { bench } from "vitest";
import { createCryptoMerkleTree } from "./crypto";
import { type CslMerkleTreeOpts, createCslMerkleTree } from "./csl";

faker.seed(456);
const elements = Array.from({ length: 10_000 }, () => faker.string.nanoid({ min: 5, max: 12 }));

bench("crypto tree", () => {
  createCryptoMerkleTree(elements);
});

bench("csl tree", () => {
  const cslConfig: CslMerkleTreeOpts<string> = {
    elementToPlutusData: (element) => PlutusData.new_bytes(Buffer.from(element, "utf8")),
  };
  createCslMerkleTree(elements, cslConfig);
});
