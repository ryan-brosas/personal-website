#!/usr/bin/env node
// M1 (Plan 01) — read-only build verifier.
// STUB (RED) — passes everything; intentionally wrong.
// Exported for test import; CLI entry runs against the root dist/.
import { fileURLToPath } from "node:url";

export const verifyBuild = (_manifest) => ({ ok: true, errors: [] });

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const result = verifyBuild({
    distDir: "dist",
    site: "https://example.com",
    expectedHtmlRoutes: [],
    expectedFileEndpoints: ["sitemap.xml", "robots.txt"],
    allowEmptySitemap: true,
  });
  if (!result.ok) {
    console.error(result.errors.join("\n"));
    process.exit(1);
  }
  console.log("verify: ok");
}
