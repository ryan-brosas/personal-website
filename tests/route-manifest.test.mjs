import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { resolveBuildManifest } from "../scripts/verify-build.mjs";

describe("content-driven build manifest", () => {
  test("build tooling inventories every routed collection", async () => {
    const records = await import("../scripts/collection-records.mjs");
    assert.ok("readCollectionRecords" in records);
    const inventory = records.readCollectionRecords();
    assert.deepEqual(Object.keys(inventory).sort(), ["case-studies", "resources", "tools", "wiki"]);
    assert.deepEqual(inventory.resources.map((entry) => entry.slug), ["ai-workflow-readiness"]);
    assert.equal(inventory.resources[0].visibility, "public");
    assert.deepEqual(inventory.tools.map((entry) => entry.slug), ["llm-watcher", "resume-bot"]);
    assert.ok(inventory.tools.every((entry) => entry.visibility === "public"));
    assert.ok(inventory.wiki.length >= 12);
    assert.ok(inventory.wiki.every((entry) => entry.visibility === "public"));
  });

  test("page visibility IDs come from filenames, not frontmatter slugs", async () => {
    const dir = mkdtempSync(join(tmpdir(), "page-visibilities-"));
    try {
      writeFileSync(
        join(dir, "about.md"),
        `---
slug: bio
visibility: public
---
About`,
        "utf-8",
      );
      const { readPageVisibilities } = await import("../scripts/collection-records.mjs");
      assert.deepEqual(readPageVisibilities(dir), { about: "public" });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("draft pages are absent while noindex pages remain build targets", () => {
    const manifest = resolveBuildManifest({
      pageVisibilities: {
        about: "draft",
        services: "public",
        contact: "noindex",
      },
      collectionEntryRoutes: [
        { path: "/case-studies/private-preview/", visibility: "noindex" },
      ],
      collectionDiscoveryRoutes: [],
    });

    assert.ok(!manifest.expectedHtmlRoutes.includes("/about/"));
    assert.ok(manifest.expectedHtmlRoutes.includes("/contact/"));
    assert.ok(manifest.expectedHtmlRoutes.includes("/case-studies/private-preview/"));
    assert.ok(manifest.expectedHtmlRoutes.includes("/case-studies/"));
    assert.ok(manifest.expectedHtmlRoutes.includes("/resources/directory/"));

    assert.ok(!manifest.expectedDiscoverableRoutes.includes("/about/"));
    assert.ok(!manifest.expectedDiscoverableRoutes.includes("/contact/"));
    assert.ok(!manifest.expectedDiscoverableRoutes.includes("/case-studies/private-preview/"));
    assert.ok(!manifest.expectedDiscoverableRoutes.includes("/case-studies/"));
    assert.ok(manifest.expectedDiscoverableRoutes.includes("/services/"));
    assert.ok(manifest.expectedDiscoverableRoutes.includes("/resources/directory/"));
  });
  test("every built internal link and fragment resolves", () => {
    const dist = join(import.meta.dirname, "..", "dist");
    const htmlFiles = readdirSync(dist, { recursive: true })
      .filter((entry) => typeof entry === "string" && entry.endsWith(".html"));
    const targetFor = (pathname) => {
      const local = decodeURIComponent(pathname).replace(/^\//, "");
      const exact = join(dist, local);
      if (existsSync(exact) && statSync(exact).isFile()) return exact;
      const index = join(dist, local, "index.html");
      if (existsSync(index)) return index;
      return pathname === "/" ? join(dist, "index.html") : undefined;
    };
    let internalLinks = 0;
    let fragmentLinks = 0;

    for (const relativePath of htmlFiles) {
      const html = readFileSync(join(dist, relativePath), "utf-8");
      const basePath = `/${relativePath.split("\\").join("/").replace(/index\.html$/, "")}`;
      for (const match of html.matchAll(/href="([^"]+)"/g)) {
        const href = match[1];
        if (!href.startsWith("/") && !href.startsWith("#")) continue;
        internalLinks += 1;
        const url = new URL(href, `https://example.com${basePath}`);
        const target = targetFor(url.pathname);
        assert.ok(target, `${relativePath} resolves ${href}`);
        if (!url.hash) continue;
        fragmentLinks += 1;
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(readFileSync(target, "utf-8").includes(`id="${id}"`), `${href} resolves its ID`);
      }
    }
    assert.ok(internalLinks > 0);
    assert.ok(fragmentLinks > 0);
  });

  test("every built asset reference resolves", () => {
    const dist = join(import.meta.dirname, "..", "dist");
    const files = readdirSync(dist, { recursive: true })
      .filter((entry) => typeof entry === "string");
    const resolvesFrom = (source, reference) => {
      if (/^(?:data:|https?:|#)/.test(reference)) return true;
      const clean = reference.split(/[?#]/)[0];
      const target = clean.startsWith("/")
        ? join(dist, clean.slice(1))
        : resolve(dirname(join(dist, source)), clean);
      return existsSync(target);
    };
    let references = 0;

    for (const relativePath of files.filter((entry) => entry.endsWith(".html"))) {
      const html = readFileSync(join(dist, relativePath), "utf-8");
      for (const match of html.matchAll(/(?:src|poster)="([^"]+)"/g)) {
        references += 1;
        assert.ok(resolvesFrom(relativePath, match[1]), `${relativePath} resolves ${match[1]}`);
      }
      for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
        for (const candidate of match[1].split(",")) {
          const reference = candidate.trim().split(/\s+/)[0];
          references += 1;
          assert.ok(resolvesFrom(relativePath, reference), `${relativePath} resolves ${reference}`);
        }
      }
    }
    for (const relativePath of files.filter((entry) => entry.endsWith(".css"))) {
      const css = readFileSync(join(dist, relativePath), "utf-8");
      for (const match of css.matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g)) {
        references += 1;
        assert.ok(resolvesFrom(relativePath, match[1]), `${relativePath} resolves ${match[1]}`);
      }
    }
    assert.ok(references > 0, "the built CSS references its local font asset");
  });

  test("built links reject executable schemes and secure new tabs", () => {
    const dist = join(import.meta.dirname, "..", "dist");
    const htmlFiles = readdirSync(dist, { recursive: true })
      .filter((entry) => typeof entry === "string" && entry.endsWith(".html"));
    let anchors = 0;

    for (const relativePath of htmlFiles) {
      const html = readFileSync(join(dist, relativePath), "utf-8");
      for (const match of html.matchAll(/<a\s+([^>]+)>/g)) {
        anchors += 1;
        const attributes = match[1];
        const href = attributes.match(/href="([^"]+)"/)?.[1] ?? "";
        assert.doesNotMatch(href, /^(?:javascript|data|vbscript):/i, `${relativePath} has a safe href`);
        if (!/target="_blank"/.test(attributes)) continue;
        const rel = attributes.match(/rel="([^"]+)"/)?.[1]?.split(/\s+/) ?? [];
        assert.ok(rel.includes("noopener"), `${relativePath} secures ${href}`);
      }
    }
    assert.ok(anchors > 0, "the build contains anchors to inspect");
  });

});
