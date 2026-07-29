// W4·T14 (SEO/GEO authority refactor) — case-studies discovery-parity + the
// hub min-child gate (INV-07). The pure helper `resolveCollectionDiscoveryRoutes` is the
// ONE source of the case-studies route inventory shared by the sitemap endpoint,
// the [slug] page, the build verifier, and the shell manifest — so the public
// canonical set, the sitemap, internal discovery, and the verifier's expected
// routes can never drift. Runs as pure Node (no Astro runtime): imports the .ts
// helpers directly via the ESM-native TypeScript resolution the runner provides.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  resolveCollectionEntryRoutes,
  resolveCollectionDiscoveryRoutes,
} from "../src/lib/site-routes.ts";
import { caseStudyRoutes, readCaseStudyRecords } from "../scripts/collection-records.mjs";

const CS = "case-studies";

describe("collection entry routing", () => {
  test("public and noindex entries are routable while drafts are excluded", () => {
    assert.deepEqual(
      resolveCollectionEntryRoutes({
        [CS]: [
          { slug: "public-entry", visibility: "public" },
          { slug: "private-preview", visibility: "noindex" },
          { slug: "unfinished", visibility: "draft" },
        ],
      }),
      [
        { path: "/case-studies/private-preview/", visibility: "noindex" },
        { path: "/case-studies/public-entry/", visibility: "public" },
      ],
    );
  });
});

describe("T14 resolveCollectionDiscoveryRoutes — hub min-child gate (INV-07)", () => {
  test("zero public entries → no hub, no children (hub not discoverable)", () => {
    // A collection with only non-public records must yield an EMPTY inventory:
    // the hub is gated off (INV-07) and no child route is discoverable.
    const routes = resolveCollectionDiscoveryRoutes({
      [CS]: [
        { slug: "draft-one", visibility: "draft" },
        { slug: "hidden-one", visibility: "noindex" },
      ],
    });
    assert.deepEqual(routes, []);
  });

  test("empty collection map → []", () => {
    assert.deepEqual(resolveCollectionDiscoveryRoutes({}), []);
    assert.deepEqual(resolveCollectionDiscoveryRoutes({ [CS]: [] }), []);
  });

  test("≥1 public entry → parent hub route + one child route per public entry", () => {
    const routes = resolveCollectionDiscoveryRoutes({
      [CS]: [{ slug: "this-site", visibility: "public" }],
    });
    assert.deepEqual(routes, [
      { path: "/case-studies/", visibility: "public" },
      { path: "/case-studies/this-site/", visibility: "public" },
    ]);
  });

  test("a public nested collection includes every ancestor hub once", () => {
    assert.deepEqual(
      resolveCollectionDiscoveryRoutes({
        resources: [],
        tools: [{ slug: "watcher", visibility: "public" }],
      }),
      [
        { path: "/resources/", visibility: "public" },
        { path: "/resources/tools/", visibility: "public" },
        { path: "/resources/tools/watcher/", visibility: "public" },
      ],
    );
  });

  test("draft/noindex entries are excluded even when a public sibling exists", () => {
    const routes = resolveCollectionDiscoveryRoutes({
      [CS]: [
        { slug: "beta", visibility: "public" },
        { slug: "alpha", visibility: "draft" },
        { slug: "gamma", visibility: "noindex" },
      ],
    });
    // Hub present (≥1 public), only the public child, children sorted by slug.
    assert.deepEqual(routes, [
      { path: "/case-studies/", visibility: "public" },
      { path: "/case-studies/beta/", visibility: "public" },
    ]);
  });

  test("multiple public entries → deterministic, slug-sorted children", () => {
    const routes = resolveCollectionDiscoveryRoutes({
      [CS]: [
        { slug: "zeta", visibility: "public" },
        { slug: "alpha", visibility: "public" },
      ],
    });
    assert.deepEqual(routes, [
      { path: "/case-studies/", visibility: "public" },
      { path: "/case-studies/alpha/", visibility: "public" },
      { path: "/case-studies/zeta/", visibility: "public" },
    ]);
  });
});

describe("T14 collection-records reader (verifier/shell single source of truth)", () => {
  test("reads the tracked case-study frontmatter (slug + visibility)", () => {
    const records = readCaseStudyRecords();
    const self = records.find((r) => r.slug === "this-site");
    assert.ok(self, "the tracked this-site.md self-project must be discovered");
    assert.equal(self.visibility, "public", "the self-project entry is public");
  });

  test("reads the public Mastra résumé bot case study", () => {
    const record = readCaseStudyRecords().find((entry) => entry.slug === "mastra-resume-bot");
    assert.ok(record, "the Mastra résumé bot case study must be tracked");
    assert.equal(record.visibility, "public");

    const paths = caseStudyRoutes().map((entry) => entry.path);
    assert.ok(paths.includes("/case-studies/mastra-resume-bot/"));
  });

  test("caseStudyRoutes() derives the same inventory from tracked content", () => {
    const routes = caseStudyRoutes();
    const paths = routes.map((r) => r.path);
    assert.ok(paths.includes("/case-studies/"), "hub is discoverable (≥1 public child)");
    assert.ok(
      paths.includes("/case-studies/this-site/"),
      "the public self-project child is discoverable",
    );
    assert.ok(
      routes.every((r) => r.visibility === "public"),
      "every discoverable case-study route is public",
    );
  });
});
