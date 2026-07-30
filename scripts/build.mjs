#!/usr/bin/env node
/**
 * Smart build entry point.
 *
 * - On Render (RENDER=true) or when BUILD_STATIC=1, produces the static
 *   demo export in out/ via scripts/build-static.mjs — so a Render static
 *   site works even with the default `npm run build` command.
 * - Everywhere else (Vercel, local), runs the normal `next build`.
 */
import { spawnSync } from "node:child_process";

const isStatic = process.env.RENDER === "true" || process.env.BUILD_STATIC === "1";

const result = isStatic
  ? spawnSync("node", ["scripts/build-static.mjs"], { stdio: "inherit" })
  : spawnSync("npx", ["next", "build"], { stdio: "inherit" });

process.exitCode = result.status ?? 1;
