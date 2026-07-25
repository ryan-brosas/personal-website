// Final-review coverage — machine-checkable ABSENCE invariants for the
// first-release IA (design §15). These assert that surfaces deferred to later
// slices are genuinely NOT present yet, so the greenfield decisions (Q6 no
// redirects; no service detail pages; no experimental AI endpoint) cannot silently
// regress. Pure Node — reads the real registry + the tracked file tree.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTE_REGISTRY } from "../src/config/routes.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exists = (rel) => fs.existsSync(path.join(repoRoot, rel));

describe("INV-08 — no service subpages (distinct intent+proof gate unmet in P0-P4)", () => {
  test("the registry has ZERO service-child / service-collection routes", () => {
    const all = ROUTE_REGISTRY.all();
    // `services` is a single static page (no [slug] detail routes, no collection).
    assert.deepEqual(
      all.filter((r) => r.parent === "services").map((r) => r.id),
      [],
      "no route declares the services page as its parent",
    );
    assert.deepEqual(
      all.filter((r) => r.collection === "services").map((r) => r.id),
      [],
      "no registry route is backed by a services collection",
    );
  });

  test("no service detail page file exists in the pages tree", () => {
    assert.ok(!exists("src/pages/services/[slug].astro"), "no dynamic service detail route");
    assert.ok(!exists("src/pages/services"), "no services/ page directory at all");
  });
});

describe("INV-14 — redirects only for previously-public URLs (greenfield: none)", () => {
  test("astro.config declares no redirect map", () => {
    const config = fs.readFileSync(path.join(repoRoot, "astro.config.mjs"), "utf-8");
    assert.ok(!/\bredirects\b/.test(config), "astro.config.mjs must declare no redirects (Q6)");
  });

  test("no redirect manifest file is tracked", () => {
    assert.ok(!exists("src/data/redirects.json"), "no redirects.json");
    assert.ok(!exists("src/config/redirects.ts"), "no redirects config module");
    assert.ok(!exists("public/_redirects"), "no host _redirects file");
  });
});

describe("INV-15 — experimental AI endpoint needs hypothesis+window+owner (absent in P0-P4)", () => {
  test("the registry exposes no llms / AI endpoint route", () => {
    const all = ROUTE_REGISTRY.all();
    assert.deepEqual(
      all.filter((r) => /llms|\bai\b/i.test(r.path)).map((r) => r.path),
      [],
      "no route path advertises an llms.txt / AI endpoint",
    );
    // The llms-experiment gate is reserved in RouteGateId but must not be wired.
    assert.ok(
      all.every((r) => r.gate !== "llms-experiment"),
      "no route references the reserved llms-experiment gate",
    );
  });

  test("no llms.txt endpoint file exists", () => {
    assert.ok(!exists("src/pages/llms.txt.ts"), "no llms.txt.ts endpoint");
    assert.ok(!exists("src/pages/llms.txt.js"), "no llms.txt.js endpoint");
    assert.ok(!exists("public/llms.txt"), "no static public/llms.txt");
  });
});
