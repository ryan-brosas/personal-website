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
import { resolveBuildManifest, verifyBuild } from "../scripts/verify-build.mjs";
import {
  collectionEntryRoutes,
  collectionDiscoveryRoutes,
  readPageVisibilities,
} from "../scripts/collection-records.mjs";
import { resolveRoutes } from "../src/lib/site-routes.ts";

// The authored first sentence of a page's markdown body. Deriving it keeps the
// "content is wired, not blank" check from going stale every copy edit.
const authoredOpening = (id) => {
  const raw = fs.readFileSync(path.join(repoRoot, "src", "content", "pages", `${id}.md`), "utf-8");
  const body = raw.replace(/^---\n[\s\S]*?\n---\n+/, "");
  return body.split(/(?<=\.)\s/).find((s) => s.trim().length > 25).trim();
};

const repoRoot = path.resolve(import.meta.dirname, "..");
const astroBin = path.join(repoRoot, "node_modules", ".bin", "astro");
const SITE = "https://example.com";

const { expectedHtmlRoutes, expectedDiscoverableRoutes, expectedFileEndpoints } =
  resolveBuildManifest({
    pageVisibilities: readPageVisibilities(),
    collectionEntryRoutes: collectionEntryRoutes(),
    collectionDiscoveryRoutes: collectionDiscoveryRoutes(),
  });

// The shell owns one bounded inline progressive-enhancement seam. JSON-LD and
// other metadata scripts are data, not behavioral JavaScript.
const assertProgressiveScripts = (html) => {
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
  const behavioral = scripts.filter(
    (tag) =>
      !/type\s*=\s*["']application\/ld\+json["']/i.test(tag) &&
      !/type\s*=\s*["']importmap["']/i.test(tag),
  );
  assert.equal(behavioral.length, 1, "the shell has exactly one behavioral enhancement");
  assert.match(behavioral[0], /data-nav-enhancement/i);
  assert.ok(!/\bsrc\s*=/i.test(behavioral[0]), "the shell enhancement stays inline");
};
const LOGO_SOURCE = path.join(repoRoot, "src/assets/brand/logo-charcoal.svg");
const LOGO_SOURCE_SHA256 = "a5e1589808b8c2a27a021bceef787ca7198e968273fe6a567c58e68515aa8cf8";
const ICON_SPRITE_SHA256 = "3fae4f90a6e1298f38ea488942ac88602d1de9f5645fef821acf31d098d910d4";

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
  test("root / is a public indexable homepage promoted through the proof gate", () => {
    // The verifier is the gate: it fails with `missing-route: /` until index.astro
    // exists, so this assertion fails before any HTML read can ENOENT. With the
    // homepage promoted, `/` is now BOTH an expected HTML route and a discoverable
    // route (the gate + the home-proof filter), so the verifier's sitemap parity
    // and canonical checks cover it.
    const result = verifyBuild({
      distDir,
      site: SITE,
      expectedHtmlRoutes,
      expectedDiscoverableRoutes,
      expectedFileEndpoints,
      allowEmptySitemap: false,
    });
    assert.equal(
      result.ok,
      true,
      `verifier must accept the promoted homepage: ${JSON.stringify(result.errors)}`,
    );

    const html = readHtml(distDir, "/");
    assert.ok(html, "dist/index.html must exist");

    // Exactly one canonical pointing at the root self-URL (trailing slash).
    const canonicals = canonicalsOf(html);
    assert.equal(canonicals.length, 1, "exactly one canonical link");
    assert.equal(canonicals[0], "https://example.com/", "canonical is the root self-URL");

    // Promoted homepage: NO noindex; an explicit index,follow robots directive.
    assert.ok(
      !/<meta\s+name="robots"\s+content="noindex,follow"/i.test(html),
      "promoted homepage has no noindex meta",
    );
    assert.ok(
      /<meta\s+name="robots"\s+content="index,follow"/i.test(html),
      "has index,follow robots meta",
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

    // Exactly one h1 with the approved identity name.
    const h1s = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(h1s, "has an h1");
    const h1Text = h1s[1].replace(/<[^>]+>/g, "").trim();
    assert.equal(html.match(/<h1/gi).length, 1, "exactly one h1");
    // The identity no longer sits in the h1 (it duplicated the header lockup), so the
  // entity is asserted where it actually carries weight: the visible brand lockup
  // and the Person node in structured data.
  assert.ok(h1Text.length > 0, "h1 is not empty");
  assert.match(html, /class="brand-wordmark">\s*<span>Ryan Brosas<\/span>/);
  assert.match(html, /"@type":"Person"[^}]*"name":"Ryan Brosas"/);
    assert.match(html, /<h2[^>]*id="case-title"/i, "case-study section uses an h2");

    // Proof-led positioning + the self-project case study link (its evidence).
    assert.ok(
      /clear systems for work that keeps coming back/i.test(html),
      "homepage carries the reader-focused positioning",
    );
    assert.ok(
      /<a[^>]+href="\/case-studies\/this-site\/"[^>]*>/i.test(html),
      "homepage links the self-project case study as its evidence",
    );

    // Person + WebSite + WebPage JSON-LD — the WebPage node is emitted ONLY for a
    // public page (INV-03), so its presence proves the promotion reached the graph.
    const jsonLd = html.match(
      /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i,
    );
    assert.ok(jsonLd, "homepage emits a JSON-LD data block");
    const graph = JSON.parse(jsonLd[1]);
    const types = graph["@graph"].map((node) => node["@type"]);
    assert.ok(types.includes("Person"), "graph has a Person node");
    assert.ok(types.includes("WebSite"), "graph has a WebSite node");
    assert.ok(types.includes("WebPage"), "graph has a WebPage node (public page, INV-03)");

    // JSON-LD is a data block, excluded from the one-behavioral-script contract.
    assertProgressiveScripts(html);
  });

  test("root / is included in the sitemap now that the gate promoted it to public", () => {
    const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");
    // Parse <loc> URLs and assert the exact root canonical IS among them now.
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(
      locs.includes("https://example.com/"),
      "root canonical is among the sitemap <loc> URLs",
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
    // Routable page links present; contact is now a routable record.
    assert.ok(/href="\/about\/"/i.test(html), "about link present (routable record)");
    assert.ok(/href="\/services\/"/i.test(html), "services link present (routable record)");
    assert.ok(/href="\/contact\/"/i.test(html), "contact link present (routable record)");
    assertProgressiveScripts(html);
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
      expectedHtmlRoutes,
      expectedDiscoverableRoutes,
      expectedFileEndpoints,
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
    assert.ok(
      /<a[^>]+href="\/resources\/"[^>]*>\s*Browse resources\s*<\/a>/i.test(mainMatch[1]),
      "404 main offers Resources as a second recovery route",
    );

    // The 404 header nav must not mark any item current (it is not a nav page).
    const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);
    assert.ok(headerMatch, "404 has a header");
    assert.ok(!/aria-current="page"/i.test(headerMatch[0]), "404 header has no aria-current=page");
  });
});

describe("C2 about route", () => {
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
      expectedHtmlRoutes,
      expectedDiscoverableRoutes,
      expectedFileEndpoints,
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
    // Services is present (public); Contact is now a routable record.
    assert.ok(/href="\/services\/"/i.test(html), "services link present (public record)");
    assert.ok(/href="\/contact\/"/i.test(html), "contact link present (routable record)");

    // Exactly one h1 with the approved About title.
    assert.equal(html.match(/<h1/gi).length, 1, "exactly one h1 on /about/");
    const aboutH1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(aboutH1, "about has an h1");
    assert.ok(
      aboutH1[1]
        .replace(/<[^>]+>/g, "")
        .trim()
        .includes("About"),
      "about h1 uses the concise approved title",
    );

    // The approved body paragraph renders — proves <Content/> is wired, not blank.
    assert.ok(
      html.includes(authoredOpening("about")),
      "about body paragraph renders the approved copy",
    );

    assertProgressiveScripts(html);
  });
});

// Copied-production fixture for routable content that is intentionally excluded
// from discovery. The tracked source is never mutated.
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
    // Rewrite the COPIED about visibility to noindex (never the tracked file).
    const aboutPath = path.join(tempRoot, "src", "content", "pages", "about.md");
    const aboutContent = fs
      .readFileSync(aboutPath, "utf-8")
      .replace(/^visibility:.*$/m, "visibility: noindex");
    fs.writeFileSync(aboutPath, aboutContent, "utf-8");

    const caseStudyPath = path.join(
      tempRoot,
      "src",
      "content",
      "case-studies",
      "this-site.md",
    );
    const caseStudyContent = fs
      .readFileSync(caseStudyPath, "utf-8")
      .replace(/^visibility:.*$/m, "visibility: noindex");
    fs.writeFileSync(caseStudyPath, caseStudyContent, "utf-8");

    const resourcePath = path.join(
      tempRoot,
      "src",
      "content",
      "resources",
      "ai-workflow-readiness.md",
    );
    const resourceContent = fs
      .readFileSync(resourcePath, "utf-8")
      .replace(/^visibility:.*$/m, "visibility: public");
    fs.writeFileSync(resourcePath, resourceContent, "utf-8");

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

  test("noindex case study is routable and excluded from discovery", () => {
    const route = "/case-studies/this-site/";
    const html = readHtml(variantDist, route);
    assert.ok(html, "variant case-study HTML must exist");
    assert.deepEqual(canonicalsOf(html), [`${SITE}${route}`]);
    assert.match(html, /<meta\s+name="robots"\s+content="noindex,follow"/i);

    const sitemap = fs.readFileSync(path.join(variantDist, "sitemap.xml"), "utf-8");
    assert.ok(!sitemap.includes(`${SITE}${route}`), "noindex case study is absent from sitemap");

    const hub = readHtml(variantDist, "/case-studies/");
    assert.ok(hub, "case-study hub remains a recovery route");
    assert.match(hub, /<meta\s+name="robots"\s+content="noindex,follow"/i);
  });

  test("public resource activates its entry, hub, nav, and sitemap", () => {
    const entryRoute = "/resources/ai-workflow-readiness/";
    const entry = readHtml(variantDist, entryRoute);
    assert.ok(entry, "public resource entry must build");
    assert.deepEqual(canonicalsOf(entry), [`${SITE}${entryRoute}`]);
    assert.ok(!/noindex,follow/i.test(entry));

    const hub = readHtml(variantDist, "/resources/");
    assert.ok(hub, "Resources hub must build");
    assert.ok(!/noindex,follow/i.test(hub));
    assert.match(hub, /href="\/resources\/ai-workflow-readiness\/"/i);

    const home = readHtml(variantDist, "/");
    assert.match(home, /href="\/resources\/"[^>]*>\s*Resources\s*<\/a>/i);

    const sitemap = fs.readFileSync(path.join(variantDist, "sitemap.xml"), "utf-8");
    assert.ok(sitemap.includes(`${SITE}/resources/`));
    assert.ok(sitemap.includes(`${SITE}${entryRoute}`));
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
    assertProgressiveScripts(html);

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

// Fail-closed evidence guard: a PUBLIC case study whose verified sourceId does not
// resolve in the registry must fail the build, rather than silently shipping a
// public page with no evidence note. Copies production, rewrites only the
// sourceId to a bogus value (keeps visibility public), and asserts the build fails.
describe("public case study evidence guard", () => {
  test("an unresolvable public evidence source fails the build", () => {
    const tempRoot = fs.mkdtempSync(path.join(repoRoot, "node_modules", ".evidence-guard-"));
    const rel = path.relative(repoRoot, tempRoot);
    assert.ok(!path.isAbsolute(rel) && !rel.startsWith(".."), "guard temp root inside repo");
    try {
      fs.cpSync(path.join(repoRoot, "src"), path.join(tempRoot, "src"), { recursive: true });
      fs.copyFileSync(path.join(repoRoot, "astro.config.mjs"), path.join(tempRoot, "astro.config.mjs"));
      fs.copyFileSync(path.join(repoRoot, "tsconfig.json"), path.join(tempRoot, "tsconfig.json"));
      fs.copyFileSync(path.join(repoRoot, "package.json"), path.join(tempRoot, "package.json"));
      const publicDir = path.join(repoRoot, "public");
      if (fs.existsSync(publicDir)) {
        fs.cpSync(publicDir, path.join(tempRoot, "public"), { recursive: true });
      }
      const caseStudyPath = path.join(tempRoot, "src", "content", "case-studies", "this-site.md");
      const broken = fs
        .readFileSync(caseStudyPath, "utf-8")
        .replace(/sourceId:.*$/m, "sourceId: source-does-not-exist-999");
      fs.writeFileSync(caseStudyPath, broken, "utf-8");

      const result = spawnSync(astroBin, ["build", "--outDir", path.join(tempRoot, "dist")], {
        cwd: tempRoot,
        encoding: "utf-8",
      });
      assert.notEqual(result.status, 0, "build must fail when a public case study's evidence does not resolve");
      assert.match(
        `${result.stdout}${result.stderr}`,
        /does not resolve to a public-safe evidence source/,
        "failure message names the unresolved evidence",
      );
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});


describe("Resources publication", () => {
  test("the public starter activates its entry, hub, navigation, and sitemap", () => {
    const hub = readHtml(distDir, "/resources/");
    assert.ok(hub, "Resources hub must build");
    assert.deepEqual(canonicalsOf(hub), [`${SITE}/resources/`]);
    assert.ok(!/noindex,follow/i.test(hub));
    assert.match(hub, /<h1[^>]*>\s*Resources\s*<\/h1>/i);
    assert.match(hub, /href="\/resources\/ai-workflow-readiness\/"/i);

    const entryRoute = "/resources/ai-workflow-readiness/";
    const entry = readHtml(distDir, entryRoute);
    assert.ok(entry, "starter resource must build");
    assert.deepEqual(canonicalsOf(entry), [`${SITE}${entryRoute}`]);

    const home = readHtml(distDir, "/");
    assert.match(home, /href="\/resources\/"[^>]*>\s*Resources\s*<\/a>/i);

    const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");
    assert.ok(sitemap.includes(`${SITE}/resources/`));
    assert.ok(sitemap.includes(`${SITE}${entryRoute}`));
  });
});

describe("C3 services route", () => {
  test("/services/ is public and discoverable with Work With Me label", () => {
    // The verifier is the gate: it fails with `missing-route: /services/` until
    // services.md exists, so the first assertion fails before any HTML read.
    const result = verifyBuild({
      distDir,
      site: SITE,
      expectedHtmlRoutes,
      expectedDiscoverableRoutes,
      expectedFileEndpoints,
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
    // Contact is now a routable record.
    assert.ok(/href="\/contact\/"/i.test(html), "contact link present (routable record)");

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
      html.includes(authoredOpening("services")),
      "services body paragraph renders the approved copy",
    );

    assertProgressiveScripts(html);
  });
});

describe("C4 contact route", () => {
  test("/contact/ is public, discoverable, and wired to settings-driven actions", () => {
    // The verifier is the gate: it fails with `missing-route: /contact/` until
    // contact.md exists with visibility public.
    const result = verifyBuild({
      distDir,
      site: SITE,
      expectedHtmlRoutes,
      expectedDiscoverableRoutes,
      expectedFileEndpoints,
      allowEmptySitemap: false,
    });
    assert.equal(
      result.ok,
      true,
      `verifier must accept /contact/: ${JSON.stringify(result.errors)}`,
    );

    const html = readHtml(distDir, "/contact/");
    assert.ok(html, "dist/contact/index.html must exist");

    const canonicals = canonicalsOf(html);
    assert.equal(canonicals.length, 1, "exactly one canonical");
    assert.equal(
      canonicals[0],
      "https://example.com/contact/",
      "canonical is the /contact/ self-URL",
    );

    // Public page has NO noindex meta.
    assert.ok(
      !/<meta\s+name="robots"\s+content="noindex,follow"/i.test(html),
      "public contact has no noindex meta",
    );

    // Contact IS in the sitemap (discoverable).
    const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf-8");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(locs.includes("https://example.com/contact/"), "contact is in the sitemap");

    // Contact link appears in navigation with the exact settings-derived label.
    assert.ok(/href="\/contact\/"/i.test(html), "contact link appears in nav");
    assert.ok(
      /<a[^>]+href="\/contact\/"[^>]*>\s*Contact\s*<\/a>/i.test(html) ||
        /<a[^>]+aria-current="page"[^>]*href="\/contact\/"[^>]*>\s*Contact\s*<\/a>/i.test(html),
      "contact nav link has the exact 'Contact' label",
    );
    // The contact link is current on /contact/.
    assert.ok(
      /<a[^>]+href="\/contact\/"[^>]*aria-current="page"/i.test(html) ||
        /<a[^>]+aria-current="page"[^>]*href="\/contact\/"/i.test(html),
      "contact link has aria-current=page on /contact/",
    );

    // Exactly one h1 with the approved Contact title.
    assert.equal(html.match(/<h1/gi).length, 1, "exactly one h1 on /contact/");
    const contactH1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(contactH1, "contact has an h1");
    assert.ok(
      contactH1[1]
        .replace(/<[^>]+>/g, "")
        .trim()
        .includes("Contact"),
      "contact h1 includes the approved title",
    );

    // The useful intake brief renders — proves <Content/> is wired, not blank.
    assert.ok(html.includes("Bring these three things"), "contact intake brief renders");

    // Settings-driven scheduler link: HTTPS Calendly URL from settings, exact
    // label, and the locked rel tokens. Rendered by the template, not markdown.
    const schedulerMatch = html.match(
      /<a[^>]*href="https:\/\/calendly\.com\/ryanjoserbrosas\/30min"[^>]*>([\s\S]*?)<\/a>/i,
    );
    assert.ok(schedulerMatch, "scheduler link uses the locked HTTPS Calendly URL from settings");
    assert.equal(
      schedulerMatch[1].replace(/<[^>]+>/g, "").trim(),
      "Schedule a conversation",
      "scheduler link has the exact label",
    );
    assert.ok(
      /rel="[^"]*\bnoopener\b[^"]*\bnoreferrer\b[^"]*"/i.test(schedulerMatch[0]) ||
        /rel="[^"]*\bnoreferrer\b[^"]*\bnoopener\b[^"]*"/i.test(schedulerMatch[0]),
      "scheduler link has rel noopener noreferrer",
    );

    // Settings-driven email fallback link: mailto with the visible address.
    const emailMatch = html.match(
      /<a[^>]*href="mailto:ryanjoserbrosas@gmail\.com"[^>]*>([\s\S]*?)<\/a>/i,
    );
    assert.ok(emailMatch, "email fallback link uses the locked mailto from settings");
    assert.equal(
      emailMatch[1].replace(/<[^>]+>/g, "").trim(),
      "ryanjoserbrosas@gmail.com",
      "email link visible text is the address",
    );

    // No Contact form, iframe, or /privacy/ link.
    assert.ok(!/<form[\s>]/i.test(html), "no Contact form");
    assert.ok(!/<iframe[\s>]/i.test(html), "no iframe");
    assert.ok(!/href="\/privacy\/"/i.test(html), "no /privacy/ link (privacyRequired is false)");

    assertProgressiveScripts(html);
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
  test("favicon endpoint exists, matches the approved charcoal mark", () => {
    // The verifier must accept favicon.svg now that it ships alongside the
    // expected file-endpoint inventory.
    const result = verifyBuild({
      distDir,
      site: SITE,
      expectedHtmlRoutes,
      expectedDiscoverableRoutes,
      expectedFileEndpoints,
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
    const routes = ["/", "/about/", "/services/", "/contact/"];
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
  test("global.css owns a self-contained semantic token source", () => {
    const globalCssPath = path.join(repoRoot, "src", "styles", "global.css");
    assert.ok(fs.existsSync(globalCssPath), "src/styles/global.css must exist");
    const source = fs.readFileSync(globalCssPath, "utf-8");
    assert.ok(!/@import\b/i.test(source), "global.css has no dependency on a removed archive");
    for (const token of ["canvas", "text-1", "font-body", "font-display", "content-max"]) {
      assert.match(source, new RegExp(`--${token}\\s*:`), `global.css defines --${token}`);
    }
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
    selectorConsumes(".skip-link", "var(--text-inverse)");
    selectorConsumes("main a", "var(--link-fg)");
    selectorConsumes("footer nav a", "var(--link-fg)");
    selectorConsumes("footer nav a", "var(--link-decoration)");
    selectorConsumes(".nav-toggle", "var(--control-bg)");
    selectorConsumes(".nav-toggle", "var(--control-fg)");
    // Every --rhythm-* role must alias a --space-* token, so consuming a
    // rhythm role below cannot smuggle an off-scale value into the 8px rhythm.
    const rhythmRoles = [...css.matchAll(/--rhythm-[a-z0-9-]+:\s*([^;]+);/g)].map((m) =>
      m[1].trim(),
    );
    assert.ok(rhythmRoles.length > 0, "CSS defines rhythm roles");
    for (const value of rhythmRoles) {
      assert.match(value, /^var\(--space-[a-z0-9-]+\)$/);
    }
    // Every nonzero padding/gap component must consume --space-* or a
    // --rhythm-* role (no arbitrary hardcoded rem/px values that bypass the 8px
    // rhythm). Handles shorthand values like "var(--space-2) 13px" by checking
    // each component independently, including across multiline declarations.
    const nonzeroPaddingGap = [...css.matchAll(/(?:padding|gap)\s*:\s*([^;}]+)/gis)].map((m) =>
      m[1].trim(),
    );
    assert.ok(nonzeroPaddingGap.length > 0, "CSS has padding/gap declarations");
    for (const value of nonzeroPaddingGap) {
      for (const component of value.split(/\s+/)) {
        if (component === "0") continue;
        assert.ok(
          /^var\(--(?:space|rhythm)-[a-z0-9-]+\)$/i.test(component),
          `padding/gap component "${component}" in "${value}" must be exactly 0, var(--space-*), or var(--rhythm-*) (no hardcoded rem/px, no mixed shorthand)`,
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

    // Exactly one element marks the current page, and on / it is the nav's Home item.
    assert.equal(
      (html.match(/aria-current="page"/g) || []).length,
      1,
      "exactly one aria-current=page",
    );

    // The nav leads with Home and owns the root current-page state; the brand
    // lockup is a plain link to the same place.
    const navMatch = html.match(/<nav[^>]*aria-label=["']Primary["'][^>]*>([\s\S]*?)<\/nav>/i);
    assert.ok(navMatch, "exactly one <nav aria-label=Primary>");
    assert.match(navMatch[1], /<a href="\/" aria-current="page">\s*Home/);
    assert.doesNotMatch(html.slice(0, html.indexOf("<nav")), /aria-current/);
    assert.ok(/href="\/about\/"/i.test(navMatch[1]), "primary nav has the about link");
    assert.ok(/href="\/services\/"/i.test(navMatch[1]), "primary nav has the services link");
    assert.ok(/href="\/contact\/"/i.test(navMatch[1]), "primary nav has the contact link");
  });

  test("about profile uses the approved Operator artwork inside an accessible supporting frame", () => {
    const html = readHtml(distDir, "/about/");
    assert.ok(html, "dist/about/index.html must exist");
    const profileVisual = html.match(
      /<aside[^>]+class="page-visual page-visual--about"[^>]+aria-label="[^"]+"[^>]*>([\s\S]*?)<\/aside>/i,
    );
    assert.ok(profileVisual, "about page has a labelled Operator profile visual");
    assert.match(profileVisual[1], /<svg[^>]+viewBox="0 0 320 320"/i);
    assert.match(profileVisual[1], /<title>The Operator<\/title>/i);
    assert.match(profileVisual[1], /aria-hidden="true"/i);
    assert.match(profileVisual[1], /focusable="false"/i);
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

  test("approved sprite asset keeps its pinned bytes and contains no script/external refs", () => {
    const spritePath = path.join(repoRoot, "src", "assets", "brand", "icons.svg");
    assert.ok(fs.existsSync(spritePath), "src/assets/brand/icons.svg must exist");
    assert.equal(
      sha256OfFile(spritePath),
      ICON_SPRITE_SHA256,
      "production sprite matches the pinned approved bytes",
    );
    const sprite = fs.readFileSync(spritePath, "utf-8");
    assert.ok(!/<script/i.test(sprite), "sprite has no <script>");
    assert.ok(!/\bhref\s*=\s*["']https?:/i.test(sprite), "sprite has no external references");
  });
});

// ── T11 authority layouts (Commercial + CaseStudy) build probe ───────────────
// CommercialLayout / CaseStudyLayout are not wired to any real page yet (pages
// land in T14/T15), so their a11y + structured-data contract is proven here by
// copying production src into an isolated repo-local temp root, adding two
// throwaway fixture pages that render each layout, building, and asserting the
// shell contract on the output HTML. The tracked source is never mutated; the
// temp root is gitignored under node_modules/. A raw `astro build` (NOT the
// verifier) is used, so the throwaway probe routes never trip the manifest.
const buildLayoutProbe = () => {
  const tempRoot = fs.mkdtempSync(path.join(repoRoot, "node_modules", ".layout-probe-"));
  const rel = path.relative(repoRoot, tempRoot);
  assert.ok(
    !path.isAbsolute(rel) && !rel.startsWith(".."),
    `probe temp root must stay inside repo (got ${rel})`,
  );

  // Copy production files needed for a standalone build (mirrors the C2 variant).
  fs.cpSync(path.join(repoRoot, "src"), path.join(tempRoot, "src"), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, "astro.config.mjs"), path.join(tempRoot, "astro.config.mjs"));
  fs.copyFileSync(path.join(repoRoot, "tsconfig.json"), path.join(tempRoot, "tsconfig.json"));
  fs.copyFileSync(path.join(repoRoot, "package.json"), path.join(tempRoot, "package.json"));
  const publicDir = path.join(repoRoot, "public");
  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, path.join(tempRoot, "public"), { recursive: true });
  }
  // Throwaway fixture pages that exercise each layout with a real public routeId.
  // NOTE: no leading underscore — Astro treats `_`-prefixed files under
  // src/pages/ as private and emits NO route for them, so the probe would build
  // clean but produce no HTML to assert on.
  const pagesDir = path.join(tempRoot, "src", "pages");
  fs.writeFileSync(
    path.join(pagesDir, "probe-commercial.astro"),
    '---\nimport CommercialLayout from "../layouts/CommercialLayout.astro";\n---\n' +
      '<CommercialLayout routeId="services" title="Work With Me" description="Probe description" visibility="public">\n' +
      "  <h1>Work With Me</h1>\n  <p>Probe commercial body.</p>\n</CommercialLayout>\n",
    "utf-8",
  );
  fs.writeFileSync(
    path.join(pagesDir, "probe-casestudy.astro"),
    '---\nimport CaseStudyLayout from "../layouts/CaseStudyLayout.astro";\n---\n' +
      '<CaseStudyLayout routeId="case-studies" title="Case Study" description="Probe description" visibility="public">\n' +
      "  <h1>Case Study Title</h1>\n  <p>Probe case-study body.</p>\n</CaseStudyLayout>\n",
    "utf-8",
  );

  const distDir = path.join(tempRoot, "dist");
  const result = spawnSync(astroBin, ["build", "--outDir", distDir], {
    cwd: tempRoot,
    encoding: "utf-8",
  });
  if (result.status !== 0) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    assert.fail(
      `layout probe build failed (status ${result.status}):\n${result.stdout}\n${result.stderr}`,
    );
  }
  return { distDir, cleanup: () => fs.rmSync(tempRoot, { recursive: true, force: true }) };
};

describe("T11 authority layouts (Commercial + CaseStudy)", () => {
  let distDir;
  let cleanup;

  before(() => {
    const built = buildLayoutProbe();
    distDir = built.distDir;
    cleanup = built.cleanup;
  });

  after(() => {
    if (cleanup) cleanup();
  });

  // One assertion set for both layouts: the shell contract must be preserved
  // (single main landmark, skip link, exactly one behavioral inline script,
  // registry-derived breadcrumbs, single h1) and the JSON-LD data block must
  // carry the entity @graph with the layout's page-kind node.
  const assertLayoutShell = (route, kindType) => {
    const html = readHtml(distDir, route);
    assert.ok(html, `probe ${route}index.html must exist`);

    // Exactly one <main id="main"> — from BaseLayout; layouts must not add a 2nd.
    assert.equal(
      (html.match(/<main[^>]*id="main"/gi) || []).length,
      1,
      `exactly one main#main on ${route}`,
    );

    // Skip link from BaseLayout survives the wrap.
    assert.ok(
      /<a[^>]+href="#main"[^>]*>\s*Skip to content\s*<\/a>/i.test(html),
      `skip-to-content link present on ${route}`,
    );

    // Exactly one behavioral enhancement; JSON-LD remains data only.
    assertProgressiveScripts(html);

    // Registry-derived breadcrumb trail rendered (Breadcrumbs component).
    assert.ok(
      /<nav[^>]*aria-label=["']Breadcrumb["']/i.test(html),
      `breadcrumb nav present on ${route}`,
    );

    // Exactly one h1 — from the page slot (BaseLayout/header/footer add none).
    assert.equal((html.match(/<h1/gi) || []).length, 1, `exactly one h1 on ${route}`);

    // A single JSON-LD data block carrying the entity @graph and the kind node.
    const ld = [
      ...html.matchAll(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ];
    assert.equal(ld.length, 1, `exactly one JSON-LD block on ${route}`);
    const graph = JSON.parse(ld[0][1]);
    assert.equal(graph["@context"], "https://schema.org", `JSON-LD @context on ${route}`);
    const types = graph["@graph"].map((node) => node["@type"]);
    assert.ok(types.includes("WebPage"), `graph has a WebPage node on ${route}`);
    assert.ok(types.includes(kindType), `graph has a ${kindType} node on ${route}`);
  };

  test("CommercialLayout preserves the shell a11y contract and emits a Service graph", () => {
    assertLayoutShell("/probe-commercial/", "Service");
  });

  test("CaseStudyLayout preserves the shell a11y contract and emits an Article graph", () => {
    assertLayoutShell("/probe-casestudy/", "Article");
  });
});

// ── T15 commercial pages (services/about/contact) — structured-data contract ──
// The three registry singleton pages render through CommercialLayout so every one
// carries an entity graph: the services page is a Service (kind:"service"), while
// about/contact are plain WebPages (kind:"webpage", no Service node — a Service on
// an about/contact page would misdescribe the visible content). Contact keeps its
// settings-driven scheduler CTA. A removed/unregistered route (/projects/) must
// produce no build output — the narrowed [page].astro iterates registry IDs only.
const jsonLdGraphsOf = (html) => {
  const stripped = html.replace(/<!--[\s\S]*?-->/g, "");
  return [
    ...stripped.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((m) => JSON.parse(m[1]));
};

describe("T15 commercial pages (services/about/contact) structured data", () => {
  const graphTypesFor = (route) => {
    const html = readHtml(distDir, route);
    assert.ok(html, `dist${route}index.html must exist`);
    const graphs = jsonLdGraphsOf(html);
    assert.equal(graphs.length, 1, `exactly one JSON-LD block on ${route}`);
    const graph = graphs[0];
    assert.equal(graph["@context"], "https://schema.org", `JSON-LD @context on ${route}`);
    return graph["@graph"].map((node) => node["@type"]);
  };

  test("/services/ emits a Service + WebPage entity graph", () => {
    const types = graphTypesFor("/services/");
    assert.ok(types.includes("WebPage"), "services graph has a WebPage node");
    assert.ok(types.includes("Service"), "services graph has a Service node");
  });

  test("/about/ emits a WebPage graph with no Service node", () => {
    const types = graphTypesFor("/about/");
    assert.ok(types.includes("WebPage"), "about graph has a WebPage node");
    assert.ok(!types.includes("Service"), "about graph has no Service node");
  });

  test("/contact/ emits a WebPage graph (no Service) and the settings scheduler CTA", () => {
    const types = graphTypesFor("/contact/");
    assert.ok(types.includes("WebPage"), "contact graph has a WebPage node");
    assert.ok(!types.includes("Service"), "contact graph has no Service node");

    const html = readHtml(distDir, "/contact/");
    const schedulerMatch = html.match(
      /<a[^>]*href="https:\/\/calendly\.com\/ryanjoserbrosas\/30min"[^>]*>([\s\S]*?)<\/a>/i,
    );
    assert.ok(
      schedulerMatch,
      "contact renders the locked HTTPS Calendly scheduler CTA from settings",
    );
    assert.equal(
      schedulerMatch[1].replace(/<[^>]+>/g, "").trim(),
      "Schedule a conversation",
      "scheduler CTA has the exact label",
    );
  });

  test("a removed/unregistered route (/projects/) produces no built page", () => {
    assert.equal(readHtml(distDir, "/projects/"), undefined, "/projects/ must not be built");
  });
});

test("commercial pages use route-specific editorial hero modules", () => {
  const about = readHtml(distDir, "/about/");
  assert.match(about, /class="page-visual page-visual--about"/);
  assert.match(about, /<title>The Operator<\/title>/);
  assert.doesNotMatch(about, /<dl>/, "the visual does not repeat profile facts from the page body");

  const services = readHtml(distDir, "/services/");
  assert.match(services, /class="page-visual page-visual--services"/);
  assert.match(services, /viewBox="0 0 1000 520"/);
  assert.match(services, />Agent<\/li>[\s\S]*>Script<\/li>[\s\S]*>Process<\/li>/);

  const contact = readHtml(distDir, "/contact/");
  assert.match(contact, /class="page-visual page-visual--contact"/);
  assert.match(contact, /class="contact-action-panel"/);
  assert.match(contact, />Bring the rough version\.<\/h2>/);
  assert.match(contact, /class="button-row contact-action-panel__actions"/);
  assert.doesNotMatch(contact, /class="page-cta cta-panel"/, "contact keeps one action surface");
});

test("homepage uses the hero composition and approved local typography", () => {
  const html = readHtml(distDir, "/");
  assert.match(html, /class="hero"/);
  // The hero headline names the visitor's outcome; the highlight carries the promise.
  assert.match(html, /Stop doing the same work/);
  assert.match(html, /class="brand-highlight">every week\.<\/span>/);
  assert.match(html, /class="hero__visual"/);
  assert.match(html, /class="loop-field"/);
  assert.ok(!html.includes("<title>The Operator</title>"), "homepage reserves the mascot for supporting pages");

  const css = collectCss(html, distDir);
  assert.match(css, /@font-face\s*{[^}]*font-family:\s*["\']?Inter["\']?/);
  assert.match(css, /inter-latin[^)]*\.woff2/);
  assert.match(css, /\.hero__title/);
});
// Copied-production fixture: every wiki entry is noindex, so the wiki hub has
// no public children and must itself render noindex,follow with no WebPage node
// (INV-03), mirroring the resources/case-study hub controlled-failure contract.
describe("wiki noindex variant (copied production)", () => {
  let variantDist;
  let variantCleanup;

  before(() => {
    const tempRoot = fs.mkdtempSync(path.join(repoRoot, "node_modules", ".wiki-noindex-variant-"));
    const rel = path.relative(repoRoot, tempRoot);
    assert.ok(
      !path.isAbsolute(rel) && !rel.startsWith(".."),
      `variant temp root must stay inside repo (got ${rel})`,
    );
    fs.cpSync(path.join(repoRoot, "src"), path.join(tempRoot, "src"), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, "astro.config.mjs"), path.join(tempRoot, "astro.config.mjs"));
    fs.copyFileSync(path.join(repoRoot, "tsconfig.json"), path.join(tempRoot, "tsconfig.json"));
    fs.copyFileSync(path.join(repoRoot, "package.json"), path.join(tempRoot, "package.json"));
    const publicDir = path.join(repoRoot, "public");
    if (fs.existsSync(publicDir)) {
      fs.cpSync(publicDir, path.join(tempRoot, "public"), { recursive: true });
    }
    // Rewrite EVERY copied wiki entry to noindex (never the tracked files).
    const wikiDir = path.join(tempRoot, "src", "content", "resources", "wiki");
    for (const name of fs.readdirSync(wikiDir)) {
      if (!name.endsWith(".md")) continue;
      const entryPath = path.join(wikiDir, name);
      const rewritten = fs
        .readFileSync(entryPath, "utf-8")
        .replace(/^visibility:.*$/m, "visibility: noindex");
      fs.writeFileSync(entryPath, rewritten, "utf-8");
    }
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

  test("no public wiki children => hub is noindex,follow and emits no WebPage node", () => {
    const hub = readHtml(variantDist, "/resources/wiki/");
    assert.ok(hub, "wiki hub must still build as a recovery route");
    assert.match(hub, /<meta\s+name="robots"\s+content="noindex,follow"/i);
    // INV-03: a noindex page emits NO WebPage/Article node (site identity only).
    const jsonLd = [...hub.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .map((m) => m[1])
      .join("\n");
    assert.ok(!/"@type"\s*:\s*"WebPage"/i.test(jsonLd), "noindex hub must not emit a WebPage node");
    assert.ok(!/"@type"\s*:\s*"Article"/i.test(jsonLd), "noindex hub must not emit an Article node");
  });

  test("noindex wiki entries are routable but excluded from discovery", () => {
    const entry = readHtml(variantDist, "/resources/wiki/ai-agents/");
    assert.ok(entry, "noindex wiki entry must still build (routable)");
    assert.match(entry, /<meta\s+name="robots"\s+content="noindex,follow"/i);
    const sitemap = fs.readFileSync(path.join(variantDist, "sitemap.xml"), "utf-8");
    assert.ok(!sitemap.includes(`${SITE}/resources/wiki/`), "noindex wiki routes are absent from the sitemap");
  });
});
