import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveBuildManifest } from "../scripts/verify-build.mjs";

describe("content-driven build manifest", () => {
  test("build tooling inventories every routed collection", async () => {
    const records = await import("../scripts/collection-records.mjs");
    assert.ok("readCollectionRecords" in records);
    const inventory = records.readCollectionRecords();
    assert.deepEqual(Object.keys(inventory).sort(), ["case-studies", "resources"]);
    assert.equal(inventory.resources[0].slug, "ai-workflow-readiness");
    assert.equal(inventory.resources[0].visibility, "public");
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

    assert.ok(!manifest.expectedDiscoverableRoutes.includes("/about/"));
    assert.ok(!manifest.expectedDiscoverableRoutes.includes("/contact/"));
    assert.ok(!manifest.expectedDiscoverableRoutes.includes("/case-studies/private-preview/"));
    assert.ok(!manifest.expectedDiscoverableRoutes.includes("/case-studies/"));
    assert.ok(manifest.expectedDiscoverableRoutes.includes("/services/"));
  });
});
