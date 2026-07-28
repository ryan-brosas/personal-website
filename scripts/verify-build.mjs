#!/usr/bin/env node
// M1 (Plan 01) — read-only build verifier.
// Checks generated dist/ against a manifest: expected HTML routes (with
// self-canonicals), expected file endpoints, no unexpected routes, no
// sitemap leaks of draft/noindex. Never writes or deletes build output.
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { canonicalHref, isHtmlRoute } from "../src/lib/routes.ts";
import { ROUTE_REGISTRY } from "../src/config/routes.ts";
import { isDiscoverable, isRoutable } from "../src/lib/publishing.ts";
import { resolveRoutes } from "../src/lib/site-routes.ts";
import {
  collectionEntryRoutes,
  collectionDiscoveryRoutes,
  readPageVisibilities,
} from "./collection-records.mjs";

const listFiles = (dir) => {
  const result = [];
  const walk = (d, prefix = "") => {
    for (const name of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, name.name);
      if (name.isDirectory()) {
        walk(full, path.join(prefix, name.name));
      } else {
        result.push(path.join(prefix, name.name));
      }
    }
  };
  walk(dir);
  return result;
};

// Extract canonical hrefs from HTML, order-independent (rel before or after
// href), single or double quoted, case-insensitive. Whitespace lookbehind
// prevents matching data-rel/data-href attributes.
const extractCanonicals = (html) => {
  const stripped = html.replace(/<!--[\s\S]*?-->/g, "");
  const canonicals = [];
  for (const m of stripped.matchAll(/<link\s[^>]*>/gi)) {
    const tag = m[0];
    if (!/(?<=\s)rel\s*=\s*["']canonical["']/i.test(tag)) continue;
    const hrefMatch = tag.match(/(?<=\s)href\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch) canonicals.push(hrefMatch[1]);
  }
  return canonicals;
};

const extractDeclaredDownloads = (html) => {
  const downloads = [];
  for (const match of html.matchAll(/<a\s[^>]*>/gi)) {
    const tag = match[0];
    if (!/(?<=\s)data-resource-download(?:\s|=|>)/i.test(tag)) continue;
    const href = tag.match(/(?<=\s)href\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href || !/^\/downloads\/[A-Za-z0-9][A-Za-z0-9._~/-]*$/.test(href)) continue;
    if (href.split("/").some((segment) => segment === "." || segment === "..")) continue;
    downloads.push(href.replace(/^\/+/, ""));
  }
  return downloads;
};

// Narrow _astro/ asset allowlist: only bundled CSS/SVG/image/font extensions are
// accepted. HTML and JS are rejected (M2 has no client scripts; a later plan
// that adds them must explicitly extend this set).
const ALLOWED_ASTRO_EXTENSIONS = new Set([
  ".css",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
]);

export const verifyBuild = (manifest) => {
  const {
    distDir,
    site,
    expectedHtmlRoutes = [],
    expectedDiscoverableRoutes = [],
    expectedFileEndpoints = [],
    allowEmptySitemap = false,
    forbidPlaceholderOrigin = false,
  } = manifest;

  if (!fs.existsSync(distDir)) {
    return { ok: false, errors: [`missing-dist: ${distDir} does not exist`] };
  }

  const errors = [];
  const declaredDownloads = new Set();
  for (const relPath of listFiles(distDir)) {
    const normalized = relPath.replace(/\\/g, "/");
    if (!/^resources\/[^/]+\/index\.html$/.test(normalized)) continue;
    const html = fs.readFileSync(path.join(distDir, relPath), "utf-8");
    for (const download of extractDeclaredDownloads(html)) declaredDownloads.add(download);
  }
  for (const download of declaredDownloads) {
    if (!fs.existsSync(path.join(distDir, download))) {
      errors.push(`missing-download: ${download}`);
    }
  }

  // 1. Check expected HTML routes: each must have index.html with exactly one
  //    self-canonical matching <site><route> with a trailing slash.
  for (const route of expectedHtmlRoutes) {
    const routePath = route.replace(/^\/+/, "");
    const htmlFile = path.join(distDir, routePath, "index.html");
    if (!fs.existsSync(htmlFile)) {
      errors.push(`missing-route: ${route}`);
      continue;
    }
    const html = fs.readFileSync(htmlFile, "utf-8");
    const canonicals = extractCanonicals(html);
    if (canonicals.length === 0) {
      errors.push(`missing-canonical: ${route}`);
    } else if (canonicals.length > 1) {
      errors.push(`duplicate-canonical: ${route}`);
    } else {
      const href = canonicals[0];
      const expected = canonicalHref(route, site);
      if (href !== expected) {
        try {
          const hrefOrigin = new URL(href).origin;
          const siteOrigin = new URL(site).origin;
          if (hrefOrigin !== siteOrigin) {
            errors.push(`wrong-origin-canonical: ${route} (got ${href})`);
          } else if (!href.endsWith("/")) {
            errors.push(`slash-mismatch-canonical: ${route} (got ${href})`);
          } else {
            errors.push(`wrong-canonical: ${route} (expected ${expected}, got ${href})`);
          }
        } catch {
          errors.push(`wrong-canonical: ${route} (invalid href ${href})`);
        }
      }
    }
  }

  // 2. Check expected file endpoints exist.
  for (const endpoint of expectedFileEndpoints) {
    if (!fs.existsSync(path.join(distDir, endpoint))) {
      errors.push(`missing-endpoint: ${endpoint}`);
    }
  }

  // 2b. If robots.txt is expected, verify its content: User-agent: *, no
  //     Disallow, and the correct absolute slashless Sitemap line. Parse
  //     directives line-by-line (strip comments, exact value match).
  if (expectedFileEndpoints.includes("robots.txt")) {
    const robotsPath = path.join(distDir, "robots.txt");
    if (fs.existsSync(robotsPath)) {
      const content = fs.readFileSync(robotsPath, "utf-8");
      const lines = content
        .split("\n")
        .map((l) => {
          const hashIdx = l.indexOf("#");
          return (hashIdx >= 0 ? l.slice(0, hashIdx) : l).trim();
        })
        .filter((l) => l);
      let hasUserAgent = false;
      let hasCorrectSitemap = false;
      // Track the active user-agent block. The wildcard `*` block must never
      // Disallow (noindex pages stay crawlable); per-bot Disallow under a NAMED
      // agent is the intended search-vs-training differentiation and is allowed.
      let currentAgent = null;
      const siteOrigin = site.replace(/\/+$/, "");
      const expectedSitemapValue = `${siteOrigin}/sitemap.xml`;
      for (const line of lines) {
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;
        const directive = line.slice(0, colonIdx).trim().toLowerCase();
        const value = line.slice(colonIdx + 1).trim();
        if (directive === "user-agent") {
          currentAgent = value;
          if (value === "*") hasUserAgent = true;
        }
        if (directive === "disallow" && currentAgent === "*") {
          errors.push(
            "robots-has-disallow: robots.txt must not Disallow any route under User-agent: *",
          );
        }
        if (directive === "sitemap" && value === expectedSitemapValue) {
          hasCorrectSitemap = true;
        }
      }
      if (!hasUserAgent) {
        errors.push("robots-missing-user-agent: robots.txt has no User-agent: *");
      }
      if (!hasCorrectSitemap) {
        errors.push(`robots-wrong-sitemap: expected Sitemap: ${expectedSitemapValue}`);
      }
    }
  }

  // 3. Check for unexpected files in dist (routes or endpoints not in the manifest).
  for (const relPath of listFiles(distDir)) {
    const normalized = relPath.replace(/\\/g, "/");
    if (normalized.endsWith("index.html")) {
      const dir = path.dirname(normalized);
      const route = dir === "." ? "/" : `/${dir}/`;
      if (!expectedHtmlRoutes.includes(route)) {
        errors.push(`unexpected-route: ${route}`);
      }
    } else if (normalized.startsWith("_astro/")) {
      const ext = path.extname(normalized).toLowerCase();
      if (!ALLOWED_ASTRO_EXTENSIONS.has(ext)) {
        errors.push(`unexpected-asset: ${normalized} (disallowed _astro/ extension ${ext})`);
      }
      // Allowed _astro/ extensions are silently accepted (bundled CSS/SVG/image).
    } else if (declaredDownloads.has(normalized)) {
      continue;
    } else if (!expectedFileEndpoints.includes(normalized)) {
      errors.push(`unexpected-file: ${normalized}`);
    }
  }

  // 3b. Every discoverable route must also be an expected HTML route — the
  //     sitemap must not advertise a URL whose HTML output is not verified.
  for (const discoverable of expectedDiscoverableRoutes) {
    if (!expectedHtmlRoutes.includes(discoverable)) {
      errors.push(`sitemap-orphan: ${discoverable} is discoverable but not an expected HTML route`);
    }
  }

  // 4. If sitemap.xml is expected, check its content: no non-public route leaks,
  //    and empty sitemap is only allowed when allowEmptySitemap is true.
  if (expectedFileEndpoints.includes("sitemap.xml")) {
    const sitemapPath = path.join(distDir, "sitemap.xml");
    if (fs.existsSync(sitemapPath)) {
      const content = fs.readFileSync(sitemapPath, "utf-8");
      const urls = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
        m[1].replace(
          /&(amp|lt|gt|quot|apos);/g,
          (_, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[e],
        ),
      );
      if (urls.length === 0 && !allowEmptySitemap) {
        errors.push("empty-sitemap: sitemap has no URLs and allowEmptySitemap is false");
      }
      const expectedUrls = new Set(expectedDiscoverableRoutes.map((r) => canonicalHref(r, site)));
      const seen = new Set();
      for (const url of urls) {
        if (seen.has(url)) {
          errors.push(`sitemap-duplicate: ${url} appears more than once`);
        }
        seen.add(url);
        if (!expectedUrls.has(url)) {
          errors.push(`sitemap-leak: ${url} is not in expected public routes`);
        }
      }
      // Bidirectional: every expected discoverable route must appear in the sitemap.
      for (const expected of expectedDiscoverableRoutes) {
        const expectedUrl = canonicalHref(expected, site);
        if (!seen.has(expectedUrl)) {
          errors.push(`sitemap-missing: ${expectedUrl} expected but not in sitemap`);
        }
      }
    }
  }

  // 5. Placeholder-origin guard. When building for a real origin (SITE_ORIGIN set
  //    to a non-placeholder value), no built HTML may still emit the example.com
  //    placeholder in a <link rel="canonical"> or a <script type="application/
  //    ld+json"> block — that signals metadata that bypassed the SITE_ORIGIN-driven
  //    canonical pipeline. Skipped on default dev/test builds (guard off) where the
  //    placeholder origin is the expected canonical.
  if (forbidPlaceholderOrigin) {
    const PLACEHOLDER = "example.com";
    for (const relPath of listFiles(distDir)) {
      const normalized = relPath.replace(/\\/g, "/");
      if (!normalized.endsWith(".html")) continue;
      const html = fs.readFileSync(path.join(distDir, normalized), "utf-8");
      for (const href of extractCanonicals(html)) {
        if (href.includes(PLACEHOLDER)) {
          errors.push(
            `placeholder-origin-canonical: ${normalized} canonical still uses ${PLACEHOLDER} (${href})`,
          );
        }
      }
      const stripped = html.replace(/<!--[\s\S]*?-->/g, "");
      const jsonLd =
        /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      for (const m of stripped.matchAll(jsonLd)) {
        if (m[1].includes(PLACEHOLDER)) {
          errors.push(`placeholder-origin-jsonld: ${normalized} JSON-LD still uses ${PLACEHOLDER}`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
};

export const resolveBuildManifest = ({
  pageVisibilities,
  collectionEntryRoutes = [],
  collectionDiscoveryRoutes = [],
}) => {
  const definitions = ROUTE_REGISTRY.all();
  const contentRoutes = resolveRoutes(pageVisibilities);
  const codeOwnedRoutes = definitions.filter(
    (definition) =>
      definition.isDynamic !== true &&
      isHtmlRoute(definition.path) &&
      (definition.id === "home" || definition.kind === "hub") &&
      isRoutable(definition.visibility),
  );
  const expectedHtmlRoutes = [
    ...codeOwnedRoutes.map((route) => route.path),
    ...contentRoutes.map((route) => route.path),
    ...collectionEntryRoutes.map((route) => route.path),
  ];
  const expectedDiscoverableRoutes = [
    ...codeOwnedRoutes
      .filter((route) => isDiscoverable(route.visibility) && route.kind !== "hub")
      .map((route) => route.path),
    ...contentRoutes.filter((route) => isDiscoverable(route.visibility)).map((route) => route.path),
    ...collectionDiscoveryRoutes.map((route) => route.path),
  ];
  const expectedFileEndpoints = [
    ...definitions
      .filter((definition) => definition.isDynamic !== true && !isHtmlRoute(definition.path))
      .map((definition) => definition.path.replace(/^\/+/, "")),
    "favicon.svg",
    "og-default.png",
  ];

  return {
    expectedHtmlRoutes: [...new Set(expectedHtmlRoutes)],
    expectedDiscoverableRoutes: [...new Set(expectedDiscoverableRoutes)],
    expectedFileEndpoints: [...new Set(expectedFileEndpoints)],
  };
};

// The CLI manifest combines code-owned routes with visibility read from content.
// Public static assets remain explicit because they are not registry routes.
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const PLACEHOLDER_ORIGIN = "https://example.com";
  const site = process.env.SITE_ORIGIN ?? PLACEHOLDER_ORIGIN;

  const { expectedHtmlRoutes, expectedDiscoverableRoutes, expectedFileEndpoints } =
    resolveBuildManifest({
      pageVisibilities: readPageVisibilities(),
      collectionEntryRoutes: collectionEntryRoutes(),
      collectionDiscoveryRoutes: collectionDiscoveryRoutes(),
    });
  const result = verifyBuild({
    distDir: "dist",
    site,
    expectedHtmlRoutes,
    expectedDiscoverableRoutes,
    expectedFileEndpoints,
    allowEmptySitemap: false,
    forbidPlaceholderOrigin: site !== PLACEHOLDER_ORIGIN,
  });
  if (!result.ok) {
    console.error(result.errors.join("\n"));
    process.exit(1);
  }
  console.log("verify: ok");
}
