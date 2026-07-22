#!/usr/bin/env node
// M1 (Plan 01) — read-only build verifier.
// Checks generated dist/ against a manifest: expected HTML routes (with
// self-canonicals), expected file endpoints, no unexpected routes, no
// sitemap leaks of draft/noindex. Never writes or deletes build output.
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { canonicalHref } from "../src/lib/routes.ts";

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

export const verifyBuild = (manifest) => {
  const {
    distDir,
    site,
    expectedHtmlRoutes = [],
    expectedDiscoverableRoutes = [],
    expectedFileEndpoints = [],
    allowEmptySitemap = false,
  } = manifest;

  if (!fs.existsSync(distDir)) {
    return { ok: false, errors: [`missing-dist: ${distDir} does not exist`] };
  }

  const errors = [];

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
      const siteOrigin = site.replace(/\/+$/, "");
      const expectedSitemapValue = `${siteOrigin}/sitemap.xml`;
      for (const line of lines) {
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;
        const directive = line.slice(0, colonIdx).trim().toLowerCase();
        const value = line.slice(colonIdx + 1).trim();
        if (directive === "user-agent" && value === "*") hasUserAgent = true;
        if (directive === "disallow") {
          errors.push("robots-has-disallow: robots.txt must not Disallow any route");
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
    } else if (!expectedFileEndpoints.includes(normalized)) {
      errors.push(`unexpected-file: ${normalized}`);
    }
  }

  // 4. If sitemap.xml is expected, check its content: no non-public route leaks,
  //    and empty sitemap is only allowed when allowEmptySitemap is true.
  if (expectedFileEndpoints.includes("sitemap.xml")) {
    const sitemapPath = path.join(distDir, "sitemap.xml");
    if (fs.existsSync(sitemapPath)) {
      const content = fs.readFileSync(sitemapPath, "utf-8");
      const urls = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
        m[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'"),
      );
      if (urls.length === 0 && !allowEmptySitemap) {
        errors.push("empty-sitemap: sitemap has no URLs and allowEmptySitemap is false");
      }
      const expectedUrls = new Set(expectedDiscoverableRoutes.map((r) => canonicalHref(r, site)));
      for (const url of urls) {
        if (!expectedUrls.has(url)) {
          errors.push(`sitemap-leak: ${url} is not in expected public routes`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
};

// CLI entry: verify the root build.
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
