import { defineConfig } from "rollup";

import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import image from '@rollup/plugin-image';

import editJson from "./rollup-plugin-edit-json.js";

import path from "path";

const isDev = process.env.NODE_ENV === "DEV";

const version = process.env.VERSION || "0.0.0";

const OUT_DIR = "dist";

export default defineConfig([
  {
    external: ["./worker.js"],
    input: "src/content-script.ts",
    output: [
      {
        dir: OUT_DIR,
        format: "iife",
      },
    ],
    plugins: [
      del({ targets: OUT_DIR, runOnce: true, verbose: true, }),
      typescript(),
      copy({
        targets: [{ src: "src/public/*", dest: OUT_DIR }],
        verbose: true,
      }),
      editJson({
        editFn: (json) => {
          json.version = version;
          return json;
        },
        inputPath: "src/manifest.json",
        outputPath: path.join(OUT_DIR, "manifest.json"),
      }),
      !isDev && terser(),
    ],
  },
  {
    input: ["src/worker.ts", "src/bridge.ts"],
    output: {
      dir: OUT_DIR,
      format: "esm",
    },
    plugins: [resolve(), commonjs(), json(), image(), typescript(),  !isDev && terser()],
    onwarn(warning, warn) {
      // Ignore circular dependency warnings for any id containing "pdf-lib"
      if (warning.code === "CIRCULAR_DEPENDENCY" && warning.ids?.some((id) => id.includes("pdf-lib"))) {
        return;
      }
      warn(warning);
    },
  },
    
]);
