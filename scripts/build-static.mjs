#!/usr/bin/env node
/**
 * Builds a static demo export of the storefront (output: "export" -> out/).
 *
 * Server-only parts of the app (Supabase auth, admin dashboard, API routes,
 * checkout, account pages, middleware, server actions) cannot be statically
 * exported, so they are temporarily moved aside into .static-exclude/ while
 * `next build` runs with BUILD_STATIC=1, then restored — even if the build
 * fails. The normal `npm run build` / `npm run dev` app is untouched.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const excludeDir = path.join(root, ".static-exclude");

// Server-only paths (relative to repo root) excluded from the static export.
const EXCLUDED = [
  "src/middleware.ts",
  "src/app/admin",
  "src/app/api",
  "src/app/auth",
  "src/app/(storefront)/account",
  "src/app/(storefront)/checkout",
  "src/app/(storefront)/login",
  "src/app/(storefront)/register",
  "src/app/(storefront)/forgot-password",
  "src/app/(storefront)/reset-password",
  "src/app/(storefront)/track-order",
  "src/app/(storefront)/prescriptions",
  "src/app/(storefront)/contact",
];

const moved = []; // { from, to } for restoration, in move order

function moveAside(rel) {
  const from = path.join(root, rel);
  if (!fs.existsSync(from)) {
    console.warn(`[build-static] warning: ${rel} not found, skipping`);
    return;
  }
  const to = path.join(excludeDir, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
  moved.push({ from, to });
}

function restore() {
  // Restore in reverse order so nested paths come back before their parents.
  for (const { from, to } of [...moved].reverse()) {
    fs.mkdirSync(path.dirname(from), { recursive: true });
    fs.renameSync(to, from);
  }
  moved.length = 0;
  // Remove the temp dir if it is now empty.
  try {
    fs.rmSync(excludeDir, { recursive: true });
  } catch {
    /* leave it — .gitignore covers it */
  }
}

let exitCode = 0;
try {
  fs.mkdirSync(excludeDir, { recursive: true });
  for (const rel of EXCLUDED) moveAside(rel);

  console.log(`[build-static] moved ${moved.length} server-only paths aside; running next build…`);
  const result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, BUILD_STATIC: "1" },
  });
  exitCode = result.status ?? 1;
} finally {
  restore();
  console.log("[build-static] restored all moved paths");
}

process.exitCode = exitCode;
