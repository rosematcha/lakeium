import { cpSync, rmSync } from "node:fs";
import { build } from "esbuild";

rmSync("dist", { recursive: true, force: true });
cpSync("static", "dist", { recursive: true });
await build({
  entryPoints: ["src/content.ts"],
  outfile: "dist/content.js",
  bundle: true,
  format: "iife",
  target: "chrome120",
  minify: true,
});
