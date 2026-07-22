// M2 semantic shell — real-root build contract tests.
// Builds the actual project into an isolated repo-local dist (never the shared
// dist/ that `npm run build` owns) so the suite never races the build output.
// An arbitrary external /tmp outDir is unsafe: Astro 5.18.2 redirects an outDir
// outside cwd through root .astro, copies it, then removes it
// (node_modules/astro/dist/core/build/common.js:75-80, static-build.js:284-290).
// The temp parent is gitignored under node_modules/.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { verifyBuild } from "../scripts/verify-build.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const astroBin = path.join(repoRoot, "node_modules", ".bin", "astro");
const SITE = "https://example.com";

// Build the real root into an isolated repo-local dist. Asserts the outDir stays
// inside the repo before spawning Astro. Returns { distDir, cleanup }.
const buildShell = () => {
  const tempParent = fs.mkdtempSync(path.join(repoRoot, "node_modules", ".shell-test-"));
  const distDir = path.join(tempParent, "dist");
  const rel = path.relative(repoRoot, distDir);
  assert.ok(
    !path.isAbsolute(rel) && !rel.startsWith(".."),
    `isolated outDir must stay inside repo (got ${rel})`,
  );
  const result = spawnSync(astroBin, ["build", "--outDir", distDir], {
    cwd: repoRoot,
    encoding: "utf-8",
  });
  if (result.status !== 0) {
    fs.rmSync(tempParent, { recursive: true, force: true });
    assert.fail(
      `astro build failed (status ${result.status}):\n${result.stdout}\n${result.stderr}`,
    );
  }
  return { distDir, cleanup: () => fs.rmSync(tempParent, { recursive: true, force: true }) };
};

// Read a built HTML route's index.html. Returns undefined if absent (never throws).
const readHtml = (distDir, route) => {
  const rel = route.replace(/^\/+/, "");
  const file = path.join(distDir, rel, "index.html");
  if (!fs.existsSync(file)) return undefined;
  return fs.readFileSync(file, "utf-8");
};

// Extract canonical hrefs from HTML, order/quote-independent, ignoring comments.
const canonicalsOf = (html) => {
  const stripped = html.replace(/<!--[\s\S]*?-->/g, "");
  const out = [];
  for (const m of stripped.matchAll(/<link\s[^>]*>/gi)) {
    const tag = m[0];
    if (!/(?<=\s)rel\s*=\s*["']canonical["']/i.test(tag)) continue;
    const href = tag.match(/(?<=\s)href\s*=\s*["']([^"']+)["']/i);
    if (href) out.push(href[1]);
  }
  return out;
};

describe("B1 root shell", () => {
  let distDir;
  let cleanup;

  before(() => {
    const built = buildShell();
    distDir = built.distDir;
    cleanup = built.cleanup;
  });

  after(() => {
    if (cleanup) cleanup();
  });

  test("root / is a noindex self-canonical identity shell", () => {
    // The verifier is the gate: it fails with `missing-route: /` until index.astro
    // exists, so this assertion fails before any HTML read can ENOENT.
    const result = verifyBuild({
      distDir,
      site: SITE,
      expectedHtmlRoutes: ["/"],
      expectedDiscoverableRoutes: [],
      expectedFileEndpoints: ["sitemap.xml", "robots.txt"],
      allowEmptySitemap: true,
    });
    assert.equal(
      result.ok,
      true,
      `verifier must accept the root shell: ${JSON.stringify(result.errors)}`,
    );

    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");

    // Exactly one canonical pointing at the root self-URL (trailing slash).
    const canonicals = canonicalsOf(html);
    assert.equal(canonicals.length, 1, "exactly one canonical link");
    assert.equal(canonicals[0], "https://example.com/", "canonical is the root self-URL");

    // noindex,follow — noindex stays crawlable but excluded from discovery.
    assert.ok(
      /<meta\s+name="robots"\s+content="noindex,follow"/i.test(html),
      "has noindex,follow robots meta",
    );

    // Standards-mode document with language and a main landmark.
    assert.ok(/<!doctype html>/i.test(html), "has doctype");
    assert.ok(/<html[^>]*lang="en"/i.test(html), "has html lang=en");
    assert.ok(/<main[^>]*id="main"/i.test(html), "has main#main");

    // Skip link to #main.
    assert.ok(
      /<a[^>]+href="#main"[^>]*>\s*Skip to content\s*<\/a>/i.test(html),
      "has a skip-to-content link to #main",
    );

    // Exactly one h1 with approved identity copy.
    const h1s = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(h1s, "has an h1");
    const h1Text = h1s[1].replace(/<[^>]+>/g, "").trim();
    assert.equal(h1s.length === undefined ? 1 : html.match(/<h1/gi).length, 1, "exactly one h1");
    assert.ok(h1Text.includes("Ryan Brosas"), "h1 includes the identity name");

    // No client script.
    assert.ok(!/<script[\s>]/i.test(html), "no client script");
  });

  test("root / is excluded from the sitemap while noindex", () => {
    const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");
    assert.ok(!sitemap.includes("https://example.com/"), "root / is not in the sitemap");
  });
});
