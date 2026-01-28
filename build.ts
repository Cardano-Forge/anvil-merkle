import { copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { build } from "tsup";

async function main() {
  await build({
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

  console.log("[after] rewriting Buffer<ArrayBufferLike> to Buffer");
  const files = await readdir("dist");
  const dtsFiles = files.filter((f) => f.endsWith(".d.ts") || f.endsWith(".d.mts"));
  let replaced = 0;
  for (const file of dtsFiles) {
    const path = join("dist", file);
    const content = await readFile(path, "utf-8");
    if (content.includes("Buffer<ArrayBufferLike>")) {
      await writeFile(path, content.replace(/Buffer<ArrayBufferLike>/g, "Buffer"));
      replaced++;
    }
  }
  console.log(`[after] rewrote ${replaced} files`);
}

main();
