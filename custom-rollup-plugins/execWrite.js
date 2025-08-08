import { writeFile } from "fs/promises";
import { resolve } from "path";
import { pathToFileURL } from "url";

export default function execWritePlugin({ inputFile, outputFile }) {
  const fullPath = resolve(inputFile);
  const fileURL = pathToFileURL(fullPath);

  const writeFileContent = async function () {
    const { default: fn } = await import(`${fileURL.href}?t=${Date.now()}`);
    const result = typeof fn === "function" ? await fn() : fn;
    await writeFile(outputFile, JSON.stringify(result, null, 2));
    console.log("Wrote", outputFile, "from", inputFile);
  };

  return {
    name: "exec-write-plugin",

    buildStart() {
      this.addWatchFile(fullPath);
    },

    async generateBundle() {
      await writeFileContent();
    },
  };
}
