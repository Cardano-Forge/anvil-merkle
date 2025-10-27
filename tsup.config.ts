import { copyFile } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    core: "./src/core/index.ts",
    crypto: "./src/crypto.ts",
    csl: "./src/csl.ts",
  },
  dts: true,
  format: ["cjs", "esm"],
  clean: true,
  plugins: [
    {
      name: "Copy package files",
      buildEnd: async () => {
        await copyFile("./package.json", "dist/package.json");
        await copyFile("./README.md", "dist/README.md");
      },
    },
  ],
});
