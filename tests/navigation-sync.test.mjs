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

test("current navigation styling covers page and location states", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(
    css,
    /\.site-header nav a\[aria-current\]\s*\{[^}]*border-bottom-color:\s*var\(--nav-current-rule\)/s,
  );
  assert.doesNotMatch(css, /\.site-header nav a\[aria-current="page"\]/);
});

test("every built route exposes the correct primary navigation context", () => {
  const dist = path.join(repoRoot, "dist");
  const htmlFiles = fs.readdirSync(dist, { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".html"));

  for (const relativePath of htmlFiles) {
    const normalized = relativePath.split(path.sep).join("/");
    const route = normalized === "index.html"
      ? "/"
      : normalized.endsWith("/index.html")
        ? `/${normalized.slice(0, -"index.html".length)}`
        : `/${normalized}`;
    const html = fs.readFileSync(path.join(dist, relativePath), "utf-8");
    const nav = html.match(/<nav id="primary-navigation"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav, `${route} renders primary navigation`);
    const destinations = [...nav[1].matchAll(/<a[^>]*href="([^"]+)"/g)].map((match) => match[1]);
    const current = [...nav[1].matchAll(/<a[^>]*aria-current="([^"]+)"[^>]*href="([^"]+)"|<a[^>]*href="([^"]+)"[^>]*aria-current="([^"]+)"/g)]
      .map((match) => ({ value: match[1] ?? match[4], href: match[2] ?? match[3] }));

    if (route === "/404.html") {
      assert.deepEqual(current, [], `${route} has no false current location`);
      continue;
    }
    if (destinations.includes(route)) {
      assert.deepEqual(current, [{ value: "page", href: route }], route);
      continue;
    }
    const owner = destinations
      .filter((href) => href !== "/" && route.startsWith(href))
      .toSorted((left, right) => right.length - left.length)[0];
    assert.ok(owner, `${route} resolves to a primary navigation owner`);
    assert.deepEqual(current, [{ value: "location", href: owner }], route);
  }
});

test("every content route exposes one ordered registry-derived breadcrumb trail", () => {
  const dist = path.join(repoRoot, "dist");
  const htmlFiles = fs.readdirSync(dist, { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".html"));

  for (const relativePath of htmlFiles) {
    const normalized = relativePath.split(path.sep).join("/");
    const route = normalized === "index.html"
      ? "/"
      : normalized.endsWith("/index.html")
        ? `/${normalized.slice(0, -"index.html".length)}`
        : `/${normalized}`;
    const html = fs.readFileSync(path.join(dist, relativePath), "utf-8");
    const breadcrumb = html.match(/<nav aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/);

    if (route === "/" || route === "/404.html") {
      assert.equal(breadcrumb, null, `${route} has no synthetic breadcrumb`);
      continue;
    }
    assert.ok(breadcrumb, `${route} renders a breadcrumb`);
    assert.match(breadcrumb[1], /<ol[\s>]/, `${route} uses an ordered list`);
    const current = breadcrumb[1].match(/<span aria-current="page">([^<]+)<\/span>/g) ?? [];
    assert.equal(current.length, 1, `${route} has one current breadcrumb leaf`);
    const links = [...breadcrumb[1].matchAll(/<a href="([^"]+)">/g)].map((match) => match[1]);
    assert.ok(!links.includes(route), `${route} does not link its current leaf`);
    for (const href of links) {
      assert.ok(route.startsWith(href), `${href} is an ancestor of ${route}`);
    }
  }
});

test("structured breadcrumbs match every emitted visible trail", () => {
  const dist = path.join(repoRoot, "dist");
  const htmlFiles = fs.readdirSync(dist, { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".html"));
  const decode = (value) => value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();

  for (const relativePath of htmlFiles) {
    const normalized = relativePath.split(path.sep).join("/");
    const route = normalized === "index.html"
      ? "/"
      : normalized.endsWith("/index.html")
        ? `/${normalized.slice(0, -"index.html".length)}`
        : `/${normalized}`;
    const html = fs.readFileSync(path.join(dist, relativePath), "utf-8");
    const graphs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]));
    const structured = graphs.flatMap((graph) => graph["@graph"] ?? [])
      .find((node) => node["@type"] === "BreadcrumbList");
    if (structured === undefined) continue;

    const breadcrumb = html.match(/<nav aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(breadcrumb, `${route} exposes its structured breadcrumb visibly`);
    const visible = [...breadcrumb[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => {
      const href = match[1].match(/href="([^"]+)"/)?.[1] ?? route;
      return { name: decode(match[1]), path: href };
    });
    const machine = structured.itemListElement.map((item) => ({
      name: item.name,
      path: new URL(item.item).pathname,
    }));
    assert.deepEqual(machine, visible, `${route} structured and visible trails agree`);
    assert.deepEqual(
      structured.itemListElement.map((item) => item.position),
      visible.map((_, index) => index + 1),
      `${route} positions are contiguous`,
    );
  }
});
