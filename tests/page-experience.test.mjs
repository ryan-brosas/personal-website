import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const distRoot = path.join(repoRoot, "dist");
const sitemap = fs.readFileSync(path.join(distRoot, "sitemap.xml"), "utf-8");
const publicHtmlRoutes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => new URL(match[1]).pathname)
  .filter((route) => route !== "/" && route.endsWith("/"));

const readRoute = (route) =>
  fs.readFileSync(path.join(distRoot, route.slice(1), "index.html"), "utf-8");

const orientationRoutes = new Set(["/services/", "/case-studies/", "/resources/"]);

test("the sitemap discovers every public non-home HTML route under test", () => {
  assert.ok(publicHtmlRoutes.length > 0);
  assert.ok(publicHtmlRoutes.every((route) => route.endsWith("/")));
  assert.ok(!publicHtmlRoutes.includes("/"));
});

test("workflow rails appear only where they orient a service or collection", () => {
  for (const route of publicHtmlRoutes) {
    const html = readRoute(route);
    if (orientationRoutes.has(route)) {
      assert.match(html, /class="workflow-rail"/, route + " uses the orientation rail");
      assert.match(html, /class="workflow-rail__steps"/, route + " exposes every ordered step");
    } else {
      assert.doesNotMatch(html, /class="workflow-rail"/, route + " does not repeat its main content");
    }
  }
});

test("every public non-home HTML route closes with a clear next step", () => {
  for (const route of publicHtmlRoutes) {
    const html = readRoute(route);
    assert.match(html, /class="page-cta cta-panel"/, route + " renders the shared closing CTA");
    assert.match(html, /class="button button--primary"/, route + " offers a primary action");
  }
});

test("collection hubs use the Brand Lab card structure", () => {
  for (const route of ["/case-studies/", "/resources/"]) {
    const html = readRoute(route);
    assert.match(html, /<li>\s*<article class="case-card">/);
    assert.doesNotMatch(html, /<li class="case-card">/);
  }
});

test("the Brand Lab owns the shared workflow and closing CTA patterns", () => {
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.match(lab, /data-pattern="workflow-rail"/);
  assert.match(lab, /<WorkflowRail/);
  assert.match(lab, /data-pattern="page-cta"/);
  assert.match(lab, /<PageCta/);
});

test("the skip link remains readable before and during focus", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(
    css,
    /\.skip-link\s*\{[^}]*background:\s*var\(--surface-dark\)[^}]*color:\s*var\(--text-inverse\)/s,
  );
});

test("the workflow rail is a static ordered sequence, not fake live progress", () => {
  const component = fs.readFileSync(
    path.join(repoRoot, "src", "components", "WorkflowRail.astro"),
    "utf-8",
  );
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.doesNotMatch(component, /Live path|data-page-motion|workflow-rail__progress/);
  assert.doesNotMatch(css, /\.workflow-rail__progress/);
  assert.match(component, /<ol class="workflow-rail__steps">/);
});

test("page motion progressively enhances scrolling and interaction", () => {
  const component = fs.readFileSync(
    path.join(repoRoot, "src", "components", "SiteHeader.astro"),
    "utf-8",
  );
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(component, /data-nav-enhancement/);
  assert.match(component, /IntersectionObserver/);
  assert.match(component, /prefers-reduced-motion:\s*reduce/);
  assert.match(component, /data-motion-ready/);
  assert.match(css, /--motion-enter:\s*200ms/);
  assert.match(css, /--motion-enter-ease:\s*cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  assert.match(css, /html\[data-motion-ready\][^}]*data-reveal="pending"[^}]*opacity:/s);
  assert.match(css, /\.case-card\s*\{[^}]*transition:[^}]*transform/s);
});

test("entry pages use the full editorial width and concise case-study naming", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  const caseStudy = fs.readFileSync(
    path.join(repoRoot, "src", "content", "case-studies", "this-site.md"),
    "utf-8",
  );
  assert.match(caseStudy, /^title: "Building This Website"$/m);
  assert.doesNotMatch(caseStudy, /Transparent Self Project/);
  assert.match(css, /\.case-study-shell\s*\{[^}]*width:\s*100%/s);
  assert.match(css, /\.case-study-header\s*\{[^}]*grid-template-columns:/s);
});

test("the self-project case study tells a challenge-to-result story without invented proof", () => {
  const caseStudy = fs.readFileSync(
    path.join(repoRoot, "src", "content", "case-studies", "this-site.md"),
    "utf-8",
  );
  for (const heading of [
    "The starting point",
    "What had to be true",
    "What I built",
    "What changed during the build",
    "The result",
    "What remains unfinished",
  ]) {
    assert.match(caseStudy, new RegExp("^## " + heading + "$", "m"));
  }
  assert.match(caseStudy, /self-project, not a client success story/i);
  assert.match(caseStudy, /no invented metrics/i);
});

test("page patterns contain no stale wrappers or unused selector contracts", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  const page = fs.readFileSync(path.join(repoRoot, "src", "pages", "[page].astro"), "utf-8");
  const cta = fs.readFileSync(path.join(repoRoot, "src", "components", "PageCta.astro"), "utf-8");
  assert.doesNotMatch(css, /\.hero__kicker|\.hero__visual\s*>\s*svg|\.contact-actions|\.commercial-body|Method grid/);
  assert.doesNotMatch(page, /commercial-body/);
  assert.doesNotMatch(cta, /secondaryRel/);
});
