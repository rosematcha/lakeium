import { cpSync, readFileSync, rmSync } from "node:fs";
import { build } from "esbuild";

const { version } = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };

const userscriptHeader = `// ==UserScript==
// @name         Lakeium
// @namespace    lakeium
// @version      ${version}
// @description  Shows crisis support resources on Limitless deck builder.
// @match        https://my.limitlesstcg.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==
`;

const shared = { bundle: true, format: "iife", target: "chrome120" } as const;

rmSync("dist", { recursive: true, force: true });
rmSync("dist-userscript", { recursive: true, force: true });
cpSync("static", "dist", { recursive: true });
await Promise.all([
  build({ ...shared, entryPoints: ["src/content.ts"], outfile: "dist/content.js", minify: true }),
  // Userscript managers show source to users, so keep it readable.
  build({
    ...shared,
    entryPoints: ["src/userscript.ts"],
    outfile: "dist-userscript/lakeium.user.js",
    banner: { js: userscriptHeader },
  }),
]);
