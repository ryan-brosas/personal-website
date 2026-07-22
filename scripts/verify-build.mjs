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

export const verifyBuild = (manifest) => {
  const {
    distDir,
    site,
    expectedHtmlRoutes = [],
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
    const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)].map(
      (m) => m[1],
    );
    if (canonicals.length === 0) {
      errors.push(`missing-canonical: ${route}`);
    } else if (canonicals.length > 1) {
      errors.push(`duplicate-canonical: ${route}`);
    } else {
      const href = canonicals[0];
      const expected = canonicalHref(route, site);
      if (href !== expected) {
        const origin = site.replace(/\/+$/, "");
        if (!href.startsWith(origin)) {
          errors.push(`wrong-origin-canonical: ${route} (got ${href})`);
        } else if (!href.endsWith("/")) {
          errors.push(`slash-mismatch-canonical: ${route} (got ${href})`);
        } else {
          errors.push(`wrong-canonical: ${route} (expected ${expected}, got ${href})`);
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
      const urls = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      if (urls.length === 0 && !allowEmptySitemap) {
        errors.push("empty-sitemap: sitemap has no URLs and allowEmptySitemap is false");
      }
      const expectedUrls = new Set(expectedHtmlRoutes.map((r) => canonicalHref(r, site)));
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
