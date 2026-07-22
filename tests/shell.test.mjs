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
      expectedFileEndpoints: ["sitemap.xml", "robots.txt", "404.html"],
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

// Collect all CSS that applies to the built page: inline <style> blocks plus any
// linked stylesheets (Astro may emit _astro/*.css or inline small styles under
// 4096 bytes — both paths must be covered).
const collectCss = (html, distDir) => {
  let css = "";
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    css += m[1] + "\n";
  }
  for (const m of html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi)) {
    const href = m[0].match(/href=["']([^"']+)["']/i);
    if (href && href[1].startsWith("/_astro/")) {
      const file = path.join(distDir, href[1].slice(1));
      if (fs.existsSync(file)) css += fs.readFileSync(file, "utf-8") + "\n";
    }
  }
  return css;
};

describe("B2 shared shell", () => {
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

  test("header with one primary nav and a current root link", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");
    assert.ok(/<header[\s>]/i.test(html), "has a <header>");
    const navMatches = html.match(/<nav[^>]*aria-label=["']Primary["'][^>]*>/gi);
    assert.ok(navMatches && navMatches.length === 1, "exactly one <nav aria-label=Primary>");
    // The root link is current on /.
    assert.ok(
      /<a[^>]+href="\/"[^>]*aria-current="page"/i.test(html) ||
        /<a[^>]+aria-current="page"[^>]*href="\/"/i.test(html),
      "root link has aria-current=page",
    );
    // No links to page routes while no page records exist.
    assert.ok(!/href="\/about\/"/i.test(html), "no /about/ link without a routable record");
    assert.ok(!/href="\/services\/"/i.test(html), "no /services/ link without a routable record");
    assert.ok(!/href="\/contact\/"/i.test(html), "no /contact/ link without a routable record");
    assert.ok(!/<script[\s>]/i.test(html), "no client script");
  });

  test("applicable visible-focus CSS is present", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");
    const css = collectCss(html, distDir);
    assert.ok(css.length > 0, "some CSS is present (inline or linked)");
    assert.ok(/:focus-visible/i.test(css), "CSS targets :focus-visible");
    // A non-none, nonzero outline declaration exists somewhere in the CSS.
    assert.ok(/outline\s*:\s*(?!none|0\b)\S+/i.test(css), "a :focus-visible outline is not none/0");
    assert.ok(
      /outline-offset\s*:\s*(?!0\b)\S+/i.test(css),
      "a :focus-visible outline-offset is nonzero",
    );
  });
});

describe("B3 footer and 404", () => {
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

  test("footer with copyright and a secondary Home link", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");
    assert.ok(/<footer[\s>]/i.test(html), "has a <footer>");
    assert.ok(/© Ryan Brosas/i.test(html), "footer has copyright (c) Ryan Brosas");
    const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
    assert.ok(footerMatch, "footer block is parseable");
    assert.ok(
      /<nav[^>]*aria-label=["']Footer["']/i.test(footerMatch[0]),
      "footer has a secondary <nav aria-label=Footer>",
    );
    assert.ok(/<a[^>]+href="\/"[^>]*>/i.test(footerMatch[0]), "footer has a Home link to /");
  });

  test("404.html is a noindex self-canonical recovery page", () => {
    const file404 = path.join(distDir, "404.html");
    // existsSync assertion first: failure is a missing-endpoint assertion, not ENOENT.
    assert.ok(fs.existsSync(file404), "dist/404.html must exist");

    // The verifier must accept the 404 endpoint once listed.
    const result = verifyBuild({
      distDir,
      site: SITE,
      expectedHtmlRoutes: ["/"],
      expectedDiscoverableRoutes: [],
      expectedFileEndpoints: ["sitemap.xml", "robots.txt", "404.html"],
      allowEmptySitemap: true,
    });
    assert.equal(
      result.ok,
      true,
      `verifier must accept the 404 endpoint: ${JSON.stringify(result.errors)}`,
    );

    const html = fs.readFileSync(file404, "utf-8");

    // Exactly one canonical pointing at the /404.html file endpoint (slashless).
    const canonicals = canonicalsOf(html);
    assert.equal(canonicals.length, 1, "exactly one canonical link");
    assert.equal(
      canonicals[0],
      "https://example.com/404.html",
      "canonical is /404.html (not /404/)",
    );

    // noindex,follow — 404 stays crawlable but excluded from discovery.
    assert.ok(
      /<meta\s+name="robots"\s+content="noindex,follow"/i.test(html),
      "404 has noindex,follow robots meta",
    );

    // Page not found heading.
    assert.ok(/<h1[^>]*>\s*Page not found\s*<\/h1>/i.test(html), "404 has 'Page not found' h1");

    // Recovery link inside main#main with exact text.
    const mainMatch = html.match(/<main[^>]*id="main"[^>]*>([\s\S]*?)<\/main>/i);
    assert.ok(mainMatch, "404 has main#main");
    assert.ok(
      /<a[^>]+href="\/"[^>]*>\s*Return to the home page\s*<\/a>/i.test(mainMatch[1]),
      "404 main has a recovery link to / with text 'Return to the home page'",
    );

    // The 404 header nav must not mark any item current (it is not a nav page).
    const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);
    assert.ok(headerMatch, "404 has a header");
    assert.ok(!/aria-current="page"/i.test(headerMatch[0]), "404 header has no aria-current=page");
  });
});
