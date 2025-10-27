import { PlutusData } from "@emurgo/cardano-serialization-lib-nodejs-gc";
import { faker } from "@faker-js/faker";
import { bench } from "vitest";
import { createCryptoMerkleTree } from "./crypto/factory";
import type { CslMerkleTreeOpts } from "./csl/config";
import { createCslMerkleTree } from "./csl/factory";

faker.seed(456);
const elements = Array.from({ length: 10_000 }, () => faker.string.nanoid({ min: 5, max: 12 }));

bench("CryptoMerkleTree", () => {
  createCryptoMerkleTree(elements);
});

bench("CslMerkleTree", () => {
  const cslConfig: CslMerkleTreeOpts<string> = {
    elementToPlutusData: (element) => PlutusData.new_bytes(Buffer.from(element, "utf8")),
  };
  createCslMerkleTree(elements, cslConfig);
});
