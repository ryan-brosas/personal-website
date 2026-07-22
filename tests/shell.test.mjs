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
import crypto from "node:crypto";
import { verifyBuild } from "../scripts/verify-build.mjs";
import { resolveRoutes } from "../src/lib/site-routes.ts";

const repoRoot = path.resolve(import.meta.dirname, "..");
const astroBin = path.join(repoRoot, "node_modules", ".bin", "astro");
const SITE = "https://example.com";

// Assert exactly one script exists and it is the marked inline nav enhancement
// (no external src, no other client scripts, no generated _astro/*.js bundles).
const assertOneNavScript = (html) => {
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
  assert.equal(scripts.length, 1, `expected exactly one script (got ${scripts.length})`);
  assert.ok(
    /data-nav-enhancement/i.test(scripts[0]),
    "the single script must be the nav enhancement",
  );
  assert.ok(
    !/\bsrc\s*=/i.test(scripts[0]),
    "the nav enhancement script must be inline (no src attribute)",
  );
};
const LOGO_SOURCE = path.join(repoRoot, "docs/Ryan-Brosas-Brand-System/logos/Logo---Ryan-1.svg");
const LOGO_SOURCE_SHA256 = "a5e1589808b8c2a27a021bceef787ca7198e968273fe6a567c58e68515aa8cf8";

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
      expectedHtmlRoutes: ["/", "/about/", "/services/"],
      expectedDiscoverableRoutes: ["/about/", "/services/"],
      expectedFileEndpoints: ["sitemap.xml", "robots.txt", "404.html", "favicon.svg"],
      allowEmptySitemap: false,
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
    assertOneNavScript(html);
  });

  test("root / is excluded from the sitemap while noindex", () => {
    const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");
    // Parse <loc> URLs and assert the exact root canonical is not among them.
    // Substring matching would false-positive once /about/ exists (it contains
    // the root origin).
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(
      !locs.includes("https://example.com/"),
      "root canonical is not among the sitemap <loc> URLs",
    );
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
    // Routable page links present; contact still absent (no record).
    assert.ok(/href="\/about\/"/i.test(html), "about link present (routable record)");
    assert.ok(/href="\/services\/"/i.test(html), "services link present (routable record)");
    assert.ok(!/href="\/contact\/"/i.test(html), "no /contact/ link without a routable record");
    assertOneNavScript(html);
  });

  test("applicable visible-focus CSS is present", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");
    const css = collectCss(html, distDir);
    assert.ok(css.length > 0, "some CSS is present (inline or linked)");
    // A :focus-visible rule must exist with a non-none/nonzero outline and a
    // nonzero outline-offset within the SAME rule (not just anywhere in the CSS,
    // which would pass `:focus-visible { outline: none }` next to an unrelated
    // nonzero outline).
    const focusRules = [...css.matchAll(/:focus-visible\s*\{([^}]*)\}/gi)].map((m) => m[1]);
    assert.ok(focusRules.length > 0, "CSS has a :focus-visible rule");
    const hasFocusOutline = focusRules.some(
      (body) =>
        /outline\s*:\s*(?!none\b|0\b)/i.test(body) && /outline-offset\s*:\s*(?!0\b)/i.test(body),
    );
    assert.ok(
      hasFocusOutline,
      "a :focus-visible rule has a non-none/nonzero outline and nonzero offset",
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
      expectedHtmlRoutes: ["/", "/about/", "/services/"],
      expectedDiscoverableRoutes: ["/about/", "/services/"],
      expectedFileEndpoints: ["sitemap.xml", "robots.txt", "404.html", "favicon.svg"],
      allowEmptySitemap: false,
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

describe("C2 about route", () => {
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

  test("unconfigured public record generates no route", () => {
    // Contract evidence: resolveRoutes only yields configured PAGES.
    // A future home.md or 404.md with visibility public must not create a route.
    assert.deepEqual(resolveRoutes({ unconfigured: "public" }), []);
  });

  test("/about/ is public and discoverable", () => {
    // The verifier is the gate: it fails until /about/ is public and in the sitemap.
    const result = verifyBuild({
      distDir,
      site: SITE,
      expectedHtmlRoutes: ["/", "/about/", "/services/"],
      expectedDiscoverableRoutes: ["/about/", "/services/"],
      expectedFileEndpoints: ["sitemap.xml", "robots.txt", "404.html", "favicon.svg"],
      allowEmptySitemap: false,
    });
    assert.equal(
      result.ok,
      true,
      `verifier must accept /about/ as public+discoverable: ${JSON.stringify(result.errors)}`,
    );

    const html = readHtml(distDir, "/about/");
    assert.ok(html, "dist/about/index.html must exist");

    const canonicals = canonicalsOf(html);
    assert.equal(canonicals.length, 1, "exactly one canonical");
    assert.equal(canonicals[0], "https://example.com/about/", "canonical is the /about/ self-URL");

    // Public page has NO noindex meta.
    assert.ok(
      !/<meta\s+name="robots"\s+content="noindex,follow"/i.test(html),
      "public about has no noindex meta",
    );

    // About IS in the sitemap (discoverable).
    const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(locs.includes("https://example.com/about/"), "about is in the sitemap");

    // About link appears in navigation with the exact settings-derived label.
    assert.ok(/href="\/about\/"/i.test(html), "about link appears in nav");
    assert.ok(
      /<a[^>]+href="\/about\/"[^>]*>\s*About\s*<\/a>/i.test(html) ||
        /<a[^>]+aria-current="page"[^>]*href="\/about\/"[^>]*>\s*About\s*<\/a>/i.test(html),
      "about nav link has the exact 'About' label",
    );
    // The about link is current on /about/.
    assert.ok(
      /<a[^>]+href="\/about\/"[^>]*aria-current="page"/i.test(html) ||
        /<a[^>]+aria-current="page"[^>]*href="\/about\/"/i.test(html),
      "about link has aria-current=page on /about/",
    );
    // Services is present (public); Contact still absent (no record).
    assert.ok(/href="\/services\/"/i.test(html), "services link present (public record)");
    assert.ok(!/href="\/contact\/"/i.test(html), "no /contact/ link without a routable record");

    // Exactly one h1 with the approved About title.
    assert.equal(html.match(/<h1/gi).length, 1, "exactly one h1 on /about/");
    const aboutH1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(aboutH1, "about has an h1");
    assert.ok(
      aboutH1[1]
        .replace(/<[^>]+>/g, "")
        .trim()
        .includes("About Ryan Brosas"),
      "about h1 includes the approved title",
    );

    // The approved body paragraph renders — proves <Content/> is wired, not blank.
    assert.ok(
      html.includes("I build agent systems so repetitive work stops coming back to you"),
      "about body paragraph renders the approved copy",
    );

    assertOneNavScript(html);
  });
});

// Permanent copied-production noindex variant: copies production src + configs
// to an isolated repo-local temp root, rewrites the COPIED about visibility to
// noindex, and builds the copy. This proves the dynamic route handles noindex
// visibility (route + noindex meta + sitemap exclusion + nav) even after the
// tracked About record is promoted to public. The tracked source is never
// mutated.
describe("C2 noindex variant (copied production)", () => {
  let variantDist;
  let variantCleanup;

  before(() => {
    const tempRoot = fs.mkdtempSync(path.join(repoRoot, "node_modules", ".core-pages-variant-"));
    const rel = path.relative(repoRoot, tempRoot);
    assert.ok(
      !path.isAbsolute(rel) && !rel.startsWith(".."),
      `variant temp root must stay inside repo (got ${rel})`,
    );

    // Copy production files needed for a standalone build.
    fs.cpSync(path.join(repoRoot, "src"), path.join(tempRoot, "src"), { recursive: true });
    fs.copyFileSync(
      path.join(repoRoot, "astro.config.mjs"),
      path.join(tempRoot, "astro.config.mjs"),
    );
    fs.copyFileSync(path.join(repoRoot, "tsconfig.json"), path.join(tempRoot, "tsconfig.json"));
    fs.copyFileSync(path.join(repoRoot, "package.json"), path.join(tempRoot, "package.json"));
    // Copy public/ (favicon + future static assets) when it exists. Guarded so the
    // variant build stays green before the favicon lands (RED phase of D1).
    const publicDir = path.join(repoRoot, "public");
    if (fs.existsSync(publicDir)) {
      fs.cpSync(publicDir, path.join(tempRoot, "public"), { recursive: true });
    }
    // Copy the canonical token sheet so the copied global.css @import resolves
    // inside the temp root (D2 dependency: src/styles/global.css imports
    // ../../docs/Ryan-Brosas-Brand-System/tokens.css).
    const tokensDest = path.join(tempRoot, "docs", "Ryan-Brosas-Brand-System", "tokens.css");
    fs.mkdirSync(path.dirname(tokensDest), { recursive: true });
    fs.copyFileSync(
      path.join(repoRoot, "docs", "Ryan-Brosas-Brand-System", "tokens.css"),
      tokensDest,
    );

    // Rewrite the COPIED about visibility to noindex (never the tracked file).
    const aboutPath = path.join(tempRoot, "src", "content", "pages", "about.md");
    const aboutContent = fs
      .readFileSync(aboutPath, "utf-8")
      .replace(/^visibility:.*$/m, "visibility: noindex");
    fs.writeFileSync(aboutPath, aboutContent, "utf-8");

    variantDist = path.join(tempRoot, "dist");
    const result = spawnSync(astroBin, ["build", "--outDir", variantDist], {
      cwd: tempRoot,
      encoding: "utf-8",
    });
    if (result.status !== 0) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      assert.fail(
        `variant build failed (status ${result.status}):\n${result.stdout}\n${result.stderr}`,
      );
    }
    variantCleanup = () => fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  after(() => {
    if (variantCleanup) variantCleanup();
  });

  test("noindex about is routable, has noindex meta, excluded from sitemap, in nav", () => {
    const html = readHtml(variantDist, "/about/");
    assert.ok(html, "variant dist/about/index.html must exist");

    const canonicals = canonicalsOf(html);
    assert.equal(canonicals.length, 1, "exactly one canonical");
    assert.equal(canonicals[0], "https://example.com/about/", "canonical is the /about/ self-URL");

    assert.ok(
      /<meta\s+name="robots"\s+content="noindex,follow"/i.test(html),
      "variant about has noindex,follow robots meta",
    );

    const sitemap = fs.readFileSync(path.join(variantDist, "sitemap.xml"), "utf-8");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(!locs.includes("https://example.com/about/"), "variant about is not in the sitemap");

    assert.ok(/href="\/about\/"/i.test(html), "variant about link appears in nav");
    assertOneNavScript(html);

    // Services stays public in the variant (only About was rewritten to noindex).
    const servicesHtml = readHtml(variantDist, "/services/");
    assert.ok(servicesHtml, "variant dist/services/index.html must exist");
    assert.ok(
      !/<meta\s+name="robots"\s+content="noindex,follow"/i.test(servicesHtml),
      "variant services has no noindex meta (stays public)",
    );
    const variantSitemap = fs.readFileSync(path.join(variantDist, "sitemap.xml"), "utf-8");
    const variantLocs = [...variantSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(
      variantLocs.includes("https://example.com/services/"),
      "variant services is in the sitemap (stays public)",
    );

    // Favicon parity: the variant build ships the same favicon as the real root.
    const variantFav = path.join(variantDist, "favicon.svg");
    assert.ok(fs.existsSync(variantFav), "variant dist/favicon.svg must exist");
    assert.equal(
      sha256OfFile(variantFav),
      LOGO_SOURCE_SHA256,
      "variant favicon matches the approved charcoal mark",
    );
    const variantAboutHtml = readHtml(variantDist, "/about/");
    assert.ok(variantAboutHtml, "variant dist/about/index.html must exist");
    assert.equal(
      faviconLinksOf(variantAboutHtml).length,
      1,
      "variant about links the favicon once",
    );
  });
});

describe("C3 services route", () => {
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

  test("/services/ is public and discoverable with Work With Me label", () => {
    // The verifier is the gate: it fails with `missing-route: /services/` until
    // services.md exists, so the first assertion fails before any HTML read.
    const result = verifyBuild({
      distDir,
      site: SITE,
      expectedHtmlRoutes: ["/", "/about/", "/services/"],
      expectedDiscoverableRoutes: ["/about/", "/services/"],
      expectedFileEndpoints: ["sitemap.xml", "robots.txt", "404.html", "favicon.svg"],
      allowEmptySitemap: false,
    });
    assert.equal(
      result.ok,
      true,
      `verifier must accept /services/: ${JSON.stringify(result.errors)}`,
    );

    const html = readHtml(distDir, "/services/");
    assert.ok(html, "dist/services/index.html must exist");

    const canonicals = canonicalsOf(html);
    assert.equal(canonicals.length, 1, "exactly one canonical");
    assert.equal(
      canonicals[0],
      "https://example.com/services/",
      "canonical is the /services/ self-URL",
    );

    // Public page has NO noindex meta.
    assert.ok(
      !/<meta\s+name="robots"\s+content="noindex,follow"/i.test(html),
      "public services has no noindex meta",
    );

    // Services IS in the sitemap (discoverable).
    const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(locs.includes("https://example.com/services/"), "services is in the sitemap");

    // Work With Me nav label appears with the exact settings-derived text.
    assert.ok(/href="\/services\/"/i.test(html), "services link appears in nav");
    assert.ok(
      /<a[^>]+href="\/services\/"[^>]*>\s*Work With Me\s*<\/a>/i.test(html) ||
        /<a[^>]+aria-current="page"[^>]*href="\/services\/"[^>]*>\s*Work With Me\s*<\/a>/i.test(
          html,
        ),
      "services nav link has the exact 'Work With Me' label",
    );
    // The services link is current on /services/.
    assert.ok(
      /<a[^>]+href="\/services\/"[^>]*aria-current="page"/i.test(html) ||
        /<a[^>]+aria-current="page"[^>]*href="\/services\/"/i.test(html),
      "services link has aria-current=page on /services/",
    );
    // Contact still absent (no record yet).
    assert.ok(!/href="\/contact\/"/i.test(html), "no /contact/ link without a routable record");

    // Exactly one h1 with the approved Services title.
    assert.equal(html.match(/<h1/gi).length, 1, "exactly one h1 on /services/");
    const servicesH1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(servicesH1, "services has an h1");
    assert.ok(
      servicesH1[1]
        .replace(/<[^>]+>/g, "")
        .trim()
        .includes("Work With Me"),
      "services h1 includes the approved title",
    );

    // The approved body paragraph renders — proves <Content/> is wired, not blank.
    assert.ok(
      html.includes("I start with the recurring work and make its context, checks, handoffs"),
      "services body paragraph renders the approved copy",
    );

    assertOneNavScript(html);
  });
});

// Extract favicon link tags (order/quote-independent), ignoring comments.
const faviconLinksOf = (html) => {
  const stripped = html.replace(/<!--[\s\S]*?-->/g, "");
  const out = [];
  for (const m of stripped.matchAll(/<link\s[^>]*>/gi)) {
    const tag = m[0];
    if (!/(?<=\s)rel\s*=\s*["']icon["']/i.test(tag)) continue;
    if (!/(?<=\s)href\s*=\s*["']\/favicon\.svg["']/i.test(tag)) continue;
    out.push(tag);
  }
  return out;
};

const sha256OfFile = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

describe("D1 favicon", () => {
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

  test("favicon endpoint exists, matches the approved charcoal mark", () => {
    // The verifier must accept favicon.svg now that it ships alongside the
    // expected file-endpoint inventory.
    const result = verifyBuild({
      distDir,
      site: SITE,
      expectedHtmlRoutes: ["/", "/about/", "/services/"],
      expectedDiscoverableRoutes: ["/about/", "/services/"],
      expectedFileEndpoints: ["sitemap.xml", "robots.txt", "404.html", "favicon.svg"],
      allowEmptySitemap: false,
    });
    assert.equal(
      result.ok,
      true,
      `verifier must accept the favicon endpoint: ${JSON.stringify(result.errors)}`,
    );

    // Existence guards before reading (assertion, not ENOENT).
    const favPath = path.join(distDir, "favicon.svg");
    assert.ok(fs.existsSync(favPath), "dist/favicon.svg must exist");

    assert.ok(fs.existsSync(LOGO_SOURCE), "approved logo source must exist");
    const publicPath = path.join(repoRoot, "public", "favicon.svg");
    assert.ok(fs.existsSync(publicPath), "public/favicon.svg must exist");

    // Byte-identical across source, public copy, and generated file.
    const sourceHash = sha256OfFile(LOGO_SOURCE);
    assert.equal(
      sourceHash,
      LOGO_SOURCE_SHA256,
      "source is the approved charcoal R/lightning mark",
    );
    assert.equal(
      sha256OfFile(publicPath),
      sourceHash,
      "public/favicon.svg matches the source bytes",
    );
    assert.equal(sha256OfFile(favPath), sourceHash, "dist/favicon.svg matches the source bytes");
  });

  test("every built page links the favicon once with type and sizes", () => {
    const routes = ["/", "/about/", "/services/"];
    for (const route of routes) {
      const html = readHtml(distDir, route);
      assert.ok(html, `dist/${route.replace(/^\/+/, "")}index.html must exist`);
      const links = faviconLinksOf(html);
      assert.equal(links.length, 1, `exactly one favicon link on ${route}`);
      assert.ok(
        /type\s*=\s*["']image\/svg\+xml["']/i.test(links[0]),
        `favicon link has type=image/svg+xml on ${route}`,
      );
      assert.ok(
        /sizes\s*=\s*["']any["']/i.test(links[0]),
        `favicon link has sizes=any on ${route}`,
      );
    }

    const file404 = path.join(distDir, "404.html");
    assert.ok(fs.existsSync(file404), "dist/404.html must exist");
    const html404 = fs.readFileSync(file404, "utf-8");
    const links404 = faviconLinksOf(html404);
    assert.equal(links404.length, 1, "exactly one favicon link on 404.html");
    assert.ok(
      /type\s*=\s*["']image\/svg\+xml["']/i.test(links404[0]),
      "favicon link has type=image/svg+xml on 404.html",
    );
  });
});

describe("D2 token shell", () => {
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

  test("global.css imports the canonical token sheet once", () => {
    const globalCssPath = path.join(repoRoot, "src", "styles", "global.css");
    // Existence guard before reading (assertion, not ENOENT).
    assert.ok(fs.existsSync(globalCssPath), "src/styles/global.css must exist");
    const source = fs.readFileSync(globalCssPath, "utf-8");
    assert.ok(
      source.includes('@import "../../docs/Ryan-Brosas-Brand-System/tokens.css"'),
      "global.css imports the canonical tokens.css via a relative path",
    );
  });

  test("built shell consumes semantic brand tokens, not system-ui", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");
    const css = collectCss(html, distDir);
    assert.ok(css.length > 0, "some CSS is present (inline or linked)");
    // Global semantic token consumption, not raw pigments or system-ui.
    for (const token of [
      "var(--canvas)",
      "var(--text-1)",
      "var(--font-body)",
      "var(--leading-body)",
      "var(--font-display)",
      "var(--content-max)",
    ]) {
      assert.ok(css.includes(token), `built CSS consumes ${token}`);
    }
    assert.ok(!/system-ui/i.test(css), "built CSS no longer uses system-ui");
  });

  test("selectors consume their semantic token roles, not raw pigments", () => {
    const globalCssPath = path.join(repoRoot, "src", "styles", "global.css");
    assert.ok(fs.existsSync(globalCssPath), "src/styles/global.css must exist");
    const css = fs.readFileSync(globalCssPath, "utf-8");
    // Per-selector token consumption (closes the false-green where a token is
    // declared but never applied to the selector that needs it).
    const selectorConsumes = (selector, token) => {
      const block = css.match(
        new RegExp(
          String.raw`(^|\})\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\s*\{([^}]*)\}`,
          "m",
        ),
      );
      assert.ok(block, `CSS has a ${selector} rule`);
      assert.ok(
        new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(block[2]),
        `${selector} consumes ${token}`,
      );
    };
    selectorConsumes("body", "var(--canvas)");
    selectorConsumes("body", "var(--text-1)");
    selectorConsumes("body", "var(--font-body)");
    selectorConsumes(".site-header", "var(--nav-bg)");
    selectorConsumes(".site-header", "var(--nav-border)");
    selectorConsumes(".site-header nav a", "var(--nav-fg)");
    selectorConsumes(".site-header nav a", "var(--link-decoration)");
    selectorConsumes(".skip-link", "var(--link-fg)");
    selectorConsumes("main a", "var(--link-fg)");
    selectorConsumes("footer nav a", "var(--link-fg)");
    selectorConsumes("footer nav a", "var(--link-decoration)");
    selectorConsumes(".nav-toggle", "var(--control-bg)");
    selectorConsumes(".nav-toggle", "var(--control-fg)");
    // Every nonzero padding/gap component must consume --space-* (no
    // arbitrary hardcoded rem/px values that bypass the 8px rhythm). Handles
    // shorthand values like "var(--space-2) 13px" by checking each component
    // independently, including across multiline declarations.
    const nonzeroPaddingGap = [...css.matchAll(/(?:padding|gap)\s*:\s*([^;}]+)/gis)].map((m) =>
      m[1].trim(),
    );
    assert.ok(nonzeroPaddingGap.length > 0, "CSS has padding/gap declarations");
    for (const value of nonzeroPaddingGap) {
      for (const component of value.split(/\s+/)) {
        if (component === "0") continue;
        assert.ok(
          /^var\(--space-[a-z0-9-]+\)$/i.test(component),
          `padding/gap component "${component}" in "${value}" must be exactly 0 or var(--space-*) (no hardcoded rem/px, no mixed shorthand)`,
        );
      }
    }

    // Negative regression: the guard rejects multiline mixed shorthand and
    // non-exact component matches (suffixed zeros and token-containing
    // hardcoded expressions).
    const multilineMixed = ".x { padding: var(--space-2)\n  13px; }";
    const multilineMixedValues = [
      ...multilineMixed.matchAll(/(?:padding|gap)\s*:\s*([^;}]+)/gis),
    ].map((m) => m[1].trim());
    let multilineMixedCaught = false;
    for (const value of multilineMixedValues) {
      for (const component of value.split(/\s+/)) {
        if (component === "0") continue;
        if (!/^var\(--space-[a-z0-9-]+\)$/i.test(component)) {
          multilineMixedCaught = true;
        }
      }
    }
    assert.ok(multilineMixedCaught, "guard rejects multiline mixed shorthand");

    const suffixedZero = ".x { padding: 0bogus; }";
    const suffixedZeroValues = [...suffixedZero.matchAll(/(?:padding|gap)\s*:\s*([^;}]+)/gis)].map(
      (m) => m[1].trim(),
    );
    let suffixedZeroCaught = false;
    for (const value of suffixedZeroValues) {
      for (const component of value.split(/\s+/)) {
        if (component === "0") continue;
        if (!/^var\(--space-[a-z0-9-]+\)$/i.test(component)) {
          suffixedZeroCaught = true;
        }
      }
    }
    assert.ok(suffixedZeroCaught, "guard rejects suffixed-zero component (0bogus)");
  });

  test("header brand lockup: decorative mark beside visible site title, root current on /", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");

    // A brand anchor linking the root, containing the approved mark (inline SVG
    // with the R/lightning viewBox) beside the visible site title.
    const brandAnchorMatch = html.match(/<a[^>]+href="\/"[^>]*>([\s\S]*?)<\/a>/i);
    assert.ok(brandAnchorMatch, "header has a root brand anchor");
    const brandInner = brandAnchorMatch[1];
    assert.ok(
      /<svg[^>]+viewBox="0 0 255 211"/i.test(brandInner),
      "brand anchor contains the approved R/lightning mark (viewBox 0 0 255 211)",
    );
    assert.ok(
      /aria-hidden="true"/i.test(brandInner) && /focusable="false"/i.test(brandInner),
      "brand mark SVG is decorative to assistive technology",
    );
    assert.ok(
      brandInner
        .replace(/<[^>]+>/g, "")
        .trim()
        .includes("Ryan Brosas"),
      "brand anchor shows the visible site title beside the mark",
    );

    // The brand anchor owns the root current-page state on /.
    assert.ok(
      /<a[^>]+href="\/"[^>]*aria-current="page"/i.test(html) ||
        /<a[^>]+aria-current="page"[^>]*href="\/"/i.test(html),
      "brand anchor has aria-current=page on /",
    );

    // The Primary nav contains only page routes (root lives in the brand anchor).
    const navMatch = html.match(/<nav[^>]*aria-label=["']Primary["'][^>]*>([\s\S]*?)<\/nav>/i);
    assert.ok(navMatch, "exactly one <nav aria-label=Primary>");
    assert.ok(
      !/href="\/"/i.test(navMatch[1]),
      "primary nav does not duplicate the root link (brand anchor owns it)",
    );
    assert.ok(/href="\/about\/"/i.test(navMatch[1]), "primary nav has the about link");
    assert.ok(/href="\/services\/"/i.test(navMatch[1]), "primary nav has the services link");
    assert.ok(!/href="\/contact\/"/i.test(navMatch[1]), "primary nav has no contact link");
  });

  test("production logo asset is byte-identical to the approved charcoal mark", () => {
    const prodLogo = path.join(repoRoot, "src", "assets", "brand", "logo-charcoal.svg");
    assert.ok(fs.existsSync(prodLogo), "src/assets/brand/logo-charcoal.svg must exist");
    assert.equal(
      sha256OfFile(prodLogo),
      LOGO_SOURCE_SHA256,
      "production logo matches the approved charcoal R/lightning mark",
    );
  });
});

// Extract the single marked nav-enhancement script tag, if present.
const navEnhancementScript = (html) => {
  const matches = [...html.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
  return matches.filter((tag) => /data-nav-enhancement/i.test(tag));
};

describe("D3 progressive navigation", () => {
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

  test("DOM order: brand anchor, then toggle, then primary nav", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");
    const brandIdx = html.indexOf('class="brand"');
    const toggleIdx = html.indexOf('class="nav-toggle"');
    const navIdx = html.indexOf('id="primary-navigation"');
    assert.ok(brandIdx > -1, "brand anchor exists");
    assert.ok(toggleIdx > -1, "toggle button exists");
    assert.ok(navIdx > -1, "primary nav has id");
    assert.ok(brandIdx < toggleIdx && toggleIdx < navIdx, "DOM order is brand -> toggle -> nav");
  });

  test("toggle button has stable name, aria-expanded, aria-controls, 44px target", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");
    const toggleMatch = html.match(/<button[^>]*class="nav-toggle"[^>]*>([\s\S]*?)<\/button>/i);
    assert.ok(toggleMatch, "toggle button exists");
    const tag = html.match(/<button[^>]*class="nav-toggle"[^>]*>/i)[0];
    assert.ok(/type="button"/i.test(tag), "toggle is type=button");
    assert.ok(/aria-expanded="false"/i.test(tag), "toggle has aria-expanded=false");
    assert.ok(
      /aria-controls="primary-navigation"/i.test(tag),
      "toggle controls primary-navigation",
    );
    // Stable accessible name "Menu".
    assert.ok(
      /<span[^>]*>\s*Menu\s*<\/span>/i.test(toggleMatch[1]) ||
        toggleMatch[1].replace(/<[^>]+>/g, "").trim() === "Menu" ||
        /aria-label="Menu"/i.test(tag),
      "toggle has a stable 'Menu' name",
    );
    // Decorative menu/close icons from the approved sprite.
    assert.ok(/href="#icon-menu"/i.test(toggleMatch[1]), "toggle uses the menu icon");
    assert.ok(/href="#icon-close"/i.test(toggleMatch[1]), "toggle uses the close icon");
    assert.ok(
      /aria-hidden="true"/i.test(toggleMatch[1]),
      "toggle icons are decorative to assistive technology",
    );
  });

  test("approved sprite is injected once with the menu/close symbols", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");
    const spriteMatches = [...html.matchAll(/class="icon-sprite"/gi)];
    assert.ok(spriteMatches.length === 1, "exactly one icon-sprite definition block");
    assert.ok(/<symbol[^>]*id="icon-menu"/i.test(html), "sprite defines icon-menu");
    assert.ok(/<symbol[^>]*id="icon-close"/i.test(html), "sprite defines icon-close");
  });

  test("exactly one marked nav-enhancement script and no generated _astro JS", () => {
    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");
    const scripts = navEnhancementScript(html);
    assert.equal(scripts.length, 1, "exactly one data-nav-enhancement script");
    // No generated JS asset under _astro/.
    const astroDir = path.join(distDir, "_astro");
    if (fs.existsSync(astroDir)) {
      const jsFiles = fs.readdirSync(astroDir).filter((f) => f.endsWith(".js"));
      assert.deepEqual(jsFiles, [], "no generated _astro/*.js assets");
    }
  });

  test("global.css defines the progressive disclosure CSS contract", () => {
    const globalCssPath = path.join(repoRoot, "src", "styles", "global.css");
    assert.ok(fs.existsSync(globalCssPath), "src/styles/global.css must exist");
    const css = fs.readFileSync(globalCssPath, "utf-8");
    // Base/unready: toggle hidden, nav visible.
    assert.ok(/\.nav-toggle\s*\{[^}]*display:\s*none/i.test(css), "toggle hidden by default");
    // Ready: toggle revealed on mobile.
    assert.ok(
      /\.site-header\[data-nav-ready\]\s*\.nav-toggle\s*\{[^}]*display:\s*inline-flex/i.test(css),
      "data-nav-ready reveals the toggle on mobile",
    );
    assert.ok(/data-nav-ready/i.test(css), "data-nav-ready gates the enhanced state");
    // Mobile disclosure collapse under the ready state.
    assert.ok(/max-width:\s*820px/i.test(css), "820px breakpoint for mobile disclosure");
    // data-open reveals the nav.
    assert.ok(/data-open/i.test(css), "data-open reveals the navigation");
    // Reduced motion removes spatial panel transition.
    assert.ok(/prefers-reduced-motion/i.test(css), "reduced-motion media query present");
  });

  test("approved sprite asset is byte-identical and contains no script/external refs", () => {
    const spritePath = path.join(repoRoot, "src", "assets", "brand", "icons.svg");
    assert.ok(fs.existsSync(spritePath), "src/assets/brand/icons.svg must exist");
    const sourceSprite = path.join(
      repoRoot,
      "docs",
      "Ryan-Brosas-Brand-System",
      "assets",
      "icons.svg",
    );
    assert.equal(
      sha256OfFile(spritePath),
      sha256OfFile(sourceSprite),
      "production sprite matches the approved sprite bytes",
    );
    const sprite = fs.readFileSync(spritePath, "utf-8");
    assert.ok(!/<script/i.test(sprite), "sprite has no <script>");
    assert.ok(!/\bhref\s*=\s*["']https?:/i.test(sprite), "sprite has no external references");
  });
});
