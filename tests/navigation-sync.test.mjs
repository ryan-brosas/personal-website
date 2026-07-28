import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const distHome = path.join(repoRoot, "dist", "index.html");

const linksIn = (html, navPattern) => {
  const nav = html.match(navPattern);
  assert.ok(nav, `navigation region ${navPattern} exists`);
  return [...nav[1].matchAll(/<a[^>]*href="([^"]+)"[^>]*>([^<]*)</g)].map(([, href, label]) => ({
    href,
    label: label.trim(),
  }));
};

test("footer navigation stays in sync with primary navigation", () => {
  const html = fs.readFileSync(distHome, "utf-8");
  const primary = linksIn(html, /<nav id="primary-navigation"[^>]*>([\s\S]*?)<\/nav>/);
  const footer = linksIn(html, /<nav aria-label="Footer">([\s\S]*?)<\/nav>/);

  // The footer may add the root link, but every primary destination must appear
  // in the footer with the same settings-backed label.
  const footerByHref = new Map(footer.map((link) => [link.href, link.label]));
  for (const link of primary) {
    assert.ok(
      footerByHref.has(link.href),
      `footer links ${link.href} ("${link.label}") like the primary nav`,
    );
    assert.equal(
      footerByHref.get(link.href),
      link.label,
      `footer label for ${link.href} matches the primary nav label`,
    );
  }

  // Both regions render the same set now that the root leads the shared nav.
  const extra = footer.filter((link) => !primary.some((p) => p.href === link.href));
  assert.deepEqual(extra.map((link) => link.href), [], "footer adds no extra destinations");
  assert.equal(footer.length, primary.length, "footer mirrors the primary nav exactly");
});

test("both navigations resolve from one shared module", () => {
  const header = fs.readFileSync(
    path.join(repoRoot, "src", "components", "SiteHeader.astro"),
    "utf-8",
  );
  const footer = fs.readFileSync(
    path.join(repoRoot, "src", "components", "SiteFooter.astro"),
    "utf-8",
  );
  for (const source of [header, footer]) {
    assert.match(source, /from "\.\.\/lib\/navigation\.ts"/);
  }
  // The footer no longer hardcodes labels or per-route path lookups.
  assert.doesNotMatch(footer, /Work With Me|ROUTE_REGISTRY\.pathFor\("services"\)/);
});
