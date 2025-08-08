import { defineConfig } from "rollup";

import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";

import path from "path";
import execWritePlugin from "./custom-rollup-plugins/execWrite.js";
import repeatConfig from "./custom-rollup-plugins/repeatConfig.js";
import simpleCfgPlugin from "./custom-rollup-plugins/simpleCfgPlugin.js";

const isDev = process.env.NODE_ENV === "DEV";

const OUT_DIR = "dist";

if (process.env.BROWSER_TARGET !== "CHROME" && process.env.BROWSER_TARGET !== "FIREFOX") {
  throw new Error("BROWSER env variable is not CHROME or FIREFOX");
}

const cfgPlugin = simpleCfgPlugin({
  firefox: process.env.BROWSER_TARGET === "FIREFOX",
  chrome: process.env.BROWSER_TARGET === "CHROME",
});

export default defineConfig([
  {
    input: ["src/background.ts"],
    output: {
      dir: OUT_DIR,
      format: "esm",
    },
    plugins: [
      // del better be the first, otherwise it will pherpas delete newly generated stuff
      del({ targets: OUT_DIR, runOnce: true, verbose: true }),
      cfgPlugin,
      typescript(),
      copy({
        targets: [{ src: "src/public/*", dest: OUT_DIR }],
        verbose: true,
        copyOnce: true,
      }),
      execWritePlugin({
        inputFile: "src/manifest.js",
        outputFile: path.join(OUT_DIR, "manifest.json"),
      }),
      !isDev && terser(),
    ],
    watch: {
      include: "src/**/*",
    },
  },

  ...repeatConfig(["src/main-cs.ts", "src/popup.ts", "src/isolated-cs.ts"], {
    output: [
      {
        dir: OUT_DIR,
        format: "iife",
      },
    ],
    plugins: [cfgPlugin, typescript(), !isDev && terser()],
  }),
]);
