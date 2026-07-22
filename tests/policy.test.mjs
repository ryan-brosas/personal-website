import { test, describe } from "node:test";
import assert from "node:assert/strict";
import sourcesRegistry from "../src/data/sources.json" with { type: "json" };
import {
  DEFAULT_VISIBILITY,
  isDiscoverable,
  isRoutable,
  validateEvidence,
  resolveRelationship,
  DateFieldsSchema,
  EvidenceSchema,
} from "../src/lib/publishing.ts";
import { ROUTES, canonicalHref, isHtmlRoute, isFileEndpoint } from "../src/lib/routes.ts";
import { renderSitemap, renderRobots } from "../src/lib/discovery.ts";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { verifyBuild } from "../scripts/verify-build.mjs";

describe("T2 publishing policy", () => {
  test("default visibility is draft (fail-closed)", () => {
    assert.equal(DEFAULT_VISIBILITY, "draft");
  });

  test("isDiscoverable is true only for public", () => {
    assert.equal(isDiscoverable("public"), true);
    assert.equal(isDiscoverable("draft"), false);
    assert.equal(isDiscoverable("noindex"), false);
  });

  test("isRoutable is true for public and noindex, false for draft", () => {
    assert.equal(isRoutable("public"), true);
    assert.equal(isRoutable("noindex"), true);
    assert.equal(isRoutable("draft"), false);
  });

  describe("evidence invariants", () => {
    test("Verified requires a sourceId present in the registry", () => {
      const registry = { "src-1": { label: "official" } };
      assert.deepEqual(validateEvidence({ kind: "verified", sourceId: "src-1" }, registry), {
        ok: true,
      });
      assert.equal(validateEvidence({ kind: "verified", sourceId: "missing" }, registry).ok, false);
      assert.equal(
        validateEvidence({ kind: "verified", sourceId: "missing" }, registry).error,
        "unknown-source",
      );
    });

    test("Proposed requires a trade-off", () => {
      assert.deepEqual(validateEvidence({ kind: "proposed", tradeOff: "speed vs. rigor" }, {}), {
        ok: true,
      });
      assert.equal(validateEvidence({ kind: "proposed", tradeOff: "" }, {}).ok, false);
      assert.equal(validateEvidence({ kind: "proposed" }, {}).ok, false);
    });

    test("Open requires missing proof and a blocked decision", () => {
      assert.deepEqual(
        validateEvidence({ kind: "open", missingProof: "awaiting audit", blocked: true }, {}),
        { ok: true },
      );
      assert.equal(validateEvidence({ kind: "open", missingProof: "x", blocked: false }).ok, false);
      assert.equal(validateEvidence({ kind: "open", missingProof: "", blocked: true }).ok, false);
      assert.equal(validateEvidence({ kind: "open", blocked: true }).ok, false);
    });

    test("unknown evidence kind is rejected", () => {
      assert.equal(validateEvidence({ kind: "bogus" }, {}).ok, false);
    });

    test("Open evidence schema rejects blocked: false at the schema boundary", () => {
      const parsed = EvidenceSchema.safeParse({ kind: "open", missingProof: "x", blocked: false });
      assert.equal(parsed.success, false, "blocked: false must fail schema parse");
    });

    test("Verified rejects inherited-property sourceId (toString, constructor)", () => {
      assert.equal(validateEvidence({ kind: "verified", sourceId: "toString" }, {}).ok, false);
      assert.equal(validateEvidence({ kind: "verified", sourceId: "constructor" }, {}).ok, false);
    });
  });

  describe("distinct date fields", () => {
    test("publishedAt, updatedAt, reviewedAt are distinct preserved fields", () => {
      const parsed = DateFieldsSchema.safeParse({
        publishedAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-02-01T00:00:00Z",
        reviewedAt: "2026-03-01T00:00:00Z",
      });
      assert.ok(parsed.success, "date fields parse");
      if (parsed.success) {
        assert.equal(parsed.data.publishedAt, "2026-01-01T00:00:00Z");
        assert.equal(parsed.data.updatedAt, "2026-02-01T00:00:00Z");
        assert.equal(parsed.data.reviewedAt, "2026-03-01T00:00:00Z");
      }
    });
  });

  describe("relationship-target resolution", () => {
    const collections = {
      projects: [
        { id: "p1", visibility: "public" },
        { id: "p2", visibility: "draft" },
        { id: "p3", visibility: "noindex" },
      ],
    };

    test("accepts a public target", () => {
      assert.equal(resolveRelationship({ collection: "projects", id: "p1" }, collections).ok, true);
    });

    test("rejects a draft target", () => {
      assert.equal(
        resolveRelationship({ collection: "projects", id: "p2" }, collections).ok,
        false,
      );
    });

    test("rejects a noindex target", () => {
      assert.equal(
        resolveRelationship({ collection: "projects", id: "p3" }, collections).ok,
        false,
      );
    });

    test("rejects a missing target", () => {
      assert.equal(
        resolveRelationship({ collection: "projects", id: "missing" }, collections).ok,
        false,
      );
    });

    test("rejects a missing collection", () => {
      assert.equal(resolveRelationship({ collection: "nope", id: "x" }, collections).ok, false);
    });
  });

  test("sources.json is the empty public-safe evidence registry", () => {
    assert.deepEqual(sourcesRegistry, {});
  });
});

describe("T3 routes and canonical helpers", () => {
  test("ROUTES is an array (empty in M1)", () => {
    assert.ok(Array.isArray(ROUTES));
  });

  describe("isHtmlRoute / isFileEndpoint", () => {
    test("HTML routes (no extension) are HTML routes", () => {
      assert.equal(isHtmlRoute("/services/"), true);
      assert.equal(isHtmlRoute("/projects/"), true);
      assert.equal(isHtmlRoute("/"), true);
    });

    test("file endpoints (with extension) are NOT HTML routes", () => {
      assert.equal(isHtmlRoute("/sitemap.xml"), false);
      assert.equal(isHtmlRoute("/robots.txt"), false);
      assert.equal(isHtmlRoute("/404.html"), false);
      assert.equal(isHtmlRoute("/rss.xml"), false);
    });

    test("file endpoints are detected by extension", () => {
      assert.equal(isFileEndpoint("/sitemap.xml"), true);
      assert.equal(isFileEndpoint("/robots.txt"), true);
      assert.equal(isFileEndpoint("/404.html"), true);
      assert.equal(isFileEndpoint("/rss.xml"), true);
    });

    test("HTML routes are NOT file endpoints", () => {
      assert.equal(isFileEndpoint("/services/"), false);
      assert.equal(isFileEndpoint("/projects/"), false);
      assert.equal(isFileEndpoint("/"), false);
    });
  });

  describe("canonicalHref", () => {
    test("HTML route gets an absolute URL with trailing slash", () => {
      assert.equal(
        canonicalHref("/services/", "https://example.com"),
        "https://example.com/services/",
      );
      assert.equal(canonicalHref("/probe/", "https://example.com"), "https://example.com/probe/");
    });

    test("root gets a single trailing slash", () => {
      assert.equal(canonicalHref("/", "https://example.com"), "https://example.com/");
    });

    test("file endpoint gets a slashless absolute URL", () => {
      assert.equal(
        canonicalHref("/sitemap.xml", "https://example.com"),
        "https://example.com/sitemap.xml",
      );
      assert.equal(
        canonicalHref("/robots.txt", "https://example.com"),
        "https://example.com/robots.txt",
      );
      assert.equal(
        canonicalHref("/404.html", "https://example.com"),
        "https://example.com/404.html",
      );
    });

    test("normalizes a trailing slash on the origin (no double slash)", () => {
      assert.equal(
        canonicalHref("/services/", "https://example.com/"),
        "https://example.com/services/",
      );
      assert.equal(
        canonicalHref("/sitemap.xml", "https://example.com/"),
        "https://example.com/sitemap.xml",
      );
    });
  });
});

describe("T4 discovery rendering", () => {
  const site = "https://example.com";

  describe("renderSitemap", () => {
    test("empty input emits a well-formed urlset placeholder", () => {
      assert.equal(
        renderSitemap([], site),
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      );
    });

    test("includes only public routes (draft and noindex excluded)", () => {
      const routes = [
        { path: "/services/", visibility: "public" },
        { path: "/draft-page/", visibility: "draft" },
        { path: "/noindex-page/", visibility: "noindex" },
        { path: "/about/", visibility: "public" },
      ];
      const xml = renderSitemap(routes, site);
      assert.ok(xml.includes("https://example.com/services/"), "services included");
      assert.ok(xml.includes("https://example.com/about/"), "about included");
      assert.ok(!xml.includes("draft-page"), "draft excluded");
      assert.ok(!xml.includes("noindex-page"), "noindex excluded");
    });

    test("emits a schema-valid urlset wrapper", () => {
      const xml = renderSitemap([{ path: "/services/", visibility: "public" }], site);
      assert.ok(
        xml.startsWith('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
        "starts with urlset",
      );
      assert.ok(xml.endsWith("</urlset>"), "ends with closing urlset");
    });

    test("deterministic order (sorted by path)", () => {
      const routes = [
        { path: "/zebra/", visibility: "public" },
        { path: "/alpha/", visibility: "public" },
        { path: "/mid/", visibility: "public" },
      ];
      const xml = renderSitemap(routes, site);
      const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      assert.deepEqual(locs, [
        "https://example.com/alpha/",
        "https://example.com/mid/",
        "https://example.com/zebra/",
      ]);
    });

    test("XML-escapes special characters in loc", () => {
      const xml = renderSitemap([{ path: "/a&b/", visibility: "public" }], site);
      assert.ok(xml.includes("https://example.com/a&amp;b/"), "ampersand escaped");
      assert.ok(!xml.includes("&b/</loc>"), "raw ampersand not in loc");
    });
  });

  describe("renderRobots", () => {
    test("emits User-agent: * with no Disallow", () => {
      const txt = renderRobots(site);
      assert.ok(txt.includes("User-agent: *"), "has User-agent: *");
      assert.ok(!txt.includes("Disallow"), "no Disallow for any route");
    });

    test("emits an absolute slashless Sitemap line", () => {
      const txt = renderRobots(site);
      assert.ok(txt.includes("Sitemap: https://example.com/sitemap.xml"), "absolute sitemap line");
      assert.ok(!txt.includes("sitemap.xml/"), "no trailing slash on sitemap endpoint");
    });

    test("normalizes a trailing slash on the origin", () => {
      const txt = renderRobots("https://example.com/");
      assert.ok(
        txt.includes("Sitemap: https://example.com/sitemap.xml"),
        "single slash between origin and endpoint",
      );
      assert.ok(!txt.includes("//sitemap.xml"), "no double slash");
    });
  });
});

describe("T5 canonical fixture", () => {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const fixtureRoot = path.resolve(import.meta.dirname, "fixtures", "policy-site");
  const fixtureDist = path.join(fixtureRoot, "dist");
  const astroBin = path.join(repoRoot, "node_modules", ".bin", "astro");

  test("fixture build emits exactly one self-canonical with trailing slash", () => {
    fs.rmSync(fixtureDist, { recursive: true, force: true });
    try {
      const result = spawnSync(astroBin, ["build", "--root", fixtureRoot], {
        cwd: repoRoot,
        encoding: "utf-8",
      });
      assert.equal(result.status, 0, `astro build failed: ${result.stderr}`);
      const html = fs.readFileSync(path.join(fixtureDist, "probe", "index.html"), "utf-8");
      const canonicals = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/g) ?? [];
      assert.equal(canonicals.length, 1, "exactly one canonical link");
      assert.ok(
        canonicals[0].includes('href="https://example.com/probe/"'),
        "canonical is the probe self-URL with trailing slash",
      );
    } finally {
      fs.rmSync(fixtureDist, { recursive: true, force: true });
    }
  });
});

describe("T6 read-only build verifier", () => {
  const site = "https://example.com";
  const emptyUrlset = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  const robots = "User-agent: *\n\nSitemap: https://example.com/sitemap.xml\n";

  const makeTempDist = (files) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-test-"));
    for (const [relPath, content] of Object.entries(files)) {
      const fullPath = path.join(dir, relPath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
    }
    return dir;
  };

  const htmlWithCanonicals = (...hrefs) => {
    const links = hrefs.map((h) => `<link rel="canonical" href="${h}">`).join("");
    return `<!DOCTYPE html><html><head>${links}</head><body></body></html>`;
  };

  const snapshotTree = (dir) => {
    const result = {};
    const walk = (d) => {
      for (const name of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, name.name);
        if (name.isDirectory()) walk(full);
        else result[path.relative(dir, full)] = fs.readFileSync(full, "utf-8");
      }
    };
    walk(dir);
    return result;
  };

  const rootManifest = (distDir) => ({
    distDir,
    site,
    expectedHtmlRoutes: [],
    expectedFileEndpoints: ["sitemap.xml", "robots.txt"],
    allowEmptySitemap: true,
  });
  const fixtureManifest = (distDir) => ({
    distDir,
    site,
    expectedHtmlRoutes: ["/probe/"],
    expectedFileEndpoints: [],
    allowEmptySitemap: false,
  });

  test("root context (empty sitemap + robots) passes", () => {
    const dir = makeTempDist({ "sitemap.xml": emptyUrlset, "robots.txt": robots });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.ok(result.ok, `expected ok: ${result.errors.join(", ")}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("fixture context (one self-canonical) passes", () => {
    const dir = makeTempDist({
      "probe/index.html": htmlWithCanonicals("https://example.com/probe/"),
    });
    try {
      const result = verifyBuild(fixtureManifest(dir));
      assert.ok(result.ok, `expected ok: ${result.errors.join(", ")}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("missing canonical fails", () => {
    const dir = makeTempDist({ "probe/index.html": htmlWithCanonicals() });
    try {
      const result = verifyBuild(fixtureManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("canonical")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("duplicate canonical fails", () => {
    const dir = makeTempDist({
      "probe/index.html": htmlWithCanonicals(
        "https://example.com/probe/",
        "https://example.com/probe/",
      ),
    });
    try {
      const result = verifyBuild(fixtureManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("canonical")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("wrong-origin canonical fails", () => {
    const dir = makeTempDist({
      "probe/index.html": htmlWithCanonicals("https://wrong.com/probe/"),
    });
    try {
      const result = verifyBuild(fixtureManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("canonical")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("slash-mismatch canonical fails", () => {
    const dir = makeTempDist({
      "probe/index.html": htmlWithCanonicals("https://example.com/probe"),
    });
    try {
      const result = verifyBuild(fixtureManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("canonical")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("sitemap leak of non-public route fails", () => {
    const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/draft-page/</loc></url></urlset>`;
    const dir = makeTempDist({ "sitemap.xml": sitemap, "robots.txt": robots });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("leak") || e.includes("sitemap")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("unexpected route in dist fails", () => {
    const dir = makeTempDist({
      "probe/index.html": htmlWithCanonicals("https://example.com/probe/"),
      "unexpected/index.html": htmlWithCanonicals("https://example.com/unexpected/"),
    });
    try {
      const result = verifyBuild(fixtureManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("unexpected")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("missing expected endpoint fails", () => {
    const dir = makeTempDist({ "robots.txt": robots });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("missing")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("verifier is read-only (no mutation to dist)", () => {
    const dir = makeTempDist({ "sitemap.xml": emptyUrlset, "robots.txt": robots });
    try {
      const before = snapshotTree(dir);
      verifyBuild(rootManifest(dir));
      const after = snapshotTree(dir);
      assert.deepEqual(after, before, "dist tree unchanged after verify");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("noindex route in sitemap fails even when in expectedHtmlRoutes", () => {
    const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/secret/</loc></url></urlset>`;
    const dir = makeTempDist({ "sitemap.xml": sitemap, "robots.txt": robots });
    try {
      const result = verifyBuild({
        distDir: dir,
        site,
        expectedHtmlRoutes: ["/public/", "/secret/"],
        expectedDiscoverableRoutes: ["/public/"],
        expectedFileEndpoints: ["sitemap.xml", "robots.txt"],
        allowEmptySitemap: false,
      });
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("leak") || e.includes("sitemap")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("robots.txt with Disallow: / fails", () => {
    const badRobots = "User-agent: *\nDisallow: /\n\nSitemap: https://example.com/sitemap.xml\n";
    const dir = makeTempDist({ "sitemap.xml": emptyUrlset, "robots.txt": badRobots });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("robots")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("robots.txt with wrong-origin Sitemap fails", () => {
    const badRobots = "User-agent: *\n\nSitemap: https://wrong.com/sitemap.xml\n";
    const dir = makeTempDist({ "sitemap.xml": emptyUrlset, "robots.txt": badRobots });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("robots")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("canonical with href before rel is detected", () => {
    const dir = makeTempDist({
      "probe/index.html": `<!DOCTYPE html><html><head><link href="https://example.com/probe/" rel="canonical"></head><body></body></html>`,
    });
    try {
      const result = verifyBuild(fixtureManifest(dir));
      assert.ok(result.ok, `expected ok: ${result.errors.join(", ")}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("wrong-origin canonical with similar prefix fails as wrong-origin", () => {
    const dir = makeTempDist({
      "probe/index.html": htmlWithCanonicals("https://example.com.evil/probe/"),
    });
    try {
      const result = verifyBuild(fixtureManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("wrong-origin")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("expectedDiscoverableRoutes defaults to empty (fail-closed)", () => {
    const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/public/</loc></url></urlset>`;
    const dir = makeTempDist({ "sitemap.xml": sitemap, "robots.txt": robots });
    try {
      const result = verifyBuild({
        distDir: dir,
        site,
        expectedHtmlRoutes: ["/public/"],
        expectedFileEndpoints: ["sitemap.xml", "robots.txt"],
        allowEmptySitemap: false,
      });
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("leak")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("robots.txt with commented Disallow passes (comment not a directive)", () => {
    const goodRobots = "User-agent: *\n# Disallow: /\n\nSitemap: https://example.com/sitemap.xml\n";
    const dir = makeTempDist({ "sitemap.xml": emptyUrlset, "robots.txt": goodRobots });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.ok(result.ok, `expected ok: ${result.errors.join(", ")}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("robots.txt with spoofed Sitemap suffix fails", () => {
    const badRobots = "User-agent: *\n\nSitemap: https://example.com/sitemap.xml.evil\n";
    const dir = makeTempDist({ "sitemap.xml": emptyUrlset, "robots.txt": badRobots });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("robots")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("canonical with data-rel attribute is NOT detected", () => {
    const dir = makeTempDist({
      "probe/index.html": `<!DOCTYPE html><html><head><link data-rel="canonical" data-href="https://example.com/probe/"></head><body></body></html>`,
    });
    try {
      const result = verifyBuild(fixtureManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("missing-canonical")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
