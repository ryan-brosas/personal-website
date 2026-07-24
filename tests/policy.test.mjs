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
import { canonicalHref, isHtmlRoute, isFileEndpoint } from "../src/lib/routes.ts";
import { ROUTE_REGISTRY } from "../src/config/routes.ts";
import { renderSitemap, renderRobots } from "../src/lib/discovery.ts";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { verifyBuild } from "../scripts/verify-build.mjs";
import {
  PageSchema,
  SettingsDataSchema,
  PublicationRecordSchema,
  SeoFieldsSchema,
  TopicFieldsSchema,
  ServiceRecordSchema,
  CaseStudyRecordSchema,
} from "../src/lib/content-schemas.ts";
import { resolveRoutes } from "../src/lib/site-routes.ts";
import markdownSafety, { assertMarkdownRendered } from "../src/lib/markdown-safety.ts";

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

    test("rejects an inherited-property collection name (constructor)", () => {
      assert.equal(
        resolveRelationship({ collection: "constructor", id: "x" }, collections).ok,
        false,
      );
    });
  });

  test("sources.json is the empty public-safe evidence registry", () => {
    assert.deepEqual(sourcesRegistry, {});
  });
});

describe("M2 content schemas (A1)", () => {
  test("PageSchema rejects missing title", () => {
    const parsed = PageSchema.safeParse({ description: "About Ryan" });
    assert.equal(parsed.success, false, "missing title must fail");
  });

  test("PageSchema rejects missing description", () => {
    const parsed = PageSchema.safeParse({ title: "About" });
    assert.equal(parsed.success, false, "missing description must fail");
  });

  test("PageSchema accepts a valid page with default draft visibility", () => {
    const parsed = PageSchema.safeParse({ title: "About", description: "About Ryan" });
    assert.ok(parsed.success, "valid page parses");
    if (parsed.success) {
      assert.equal(parsed.data.visibility, "draft", "default visibility is draft");
    }
  });

  test("PageSchema accepts a public page", () => {
    const parsed = PageSchema.safeParse({
      title: "Services",
      description: "Work with me",
      visibility: "public",
    });
    assert.ok(parsed.success, "public page parses");
  });

  // E1 fixtures — locked operator inputs (spec.md:25-28).
  const lockedContact = {
    schedulerUrl: "https://calendly.com/ryanjoserbrosas/30min",
    emailFallback: "ryanjoserbrosas@gmail.com",
    privacyRequired: false,
  };

  const validSettings = (contact = lockedContact) => ({
    siteTitle: "Ryan Brosas",
    navLabels: { about: "About", services: "Work With Me", contact: "Contact" },
    contact: { ...contact },
  });

  test("E1 contact settings: rejects missing navLabels", () => {
    const parsed = SettingsDataSchema.safeParse({ ...validSettings(), navLabels: undefined });
    assert.equal(parsed.success, false, "missing navLabels must fail");
  });

  test("E1 contact settings: rejects missing siteTitle", () => {
    const parsed = SettingsDataSchema.safeParse({ ...validSettings(), siteTitle: undefined });
    assert.equal(parsed.success, false, "missing siteTitle must fail");
  });

  test("E1 contact settings: accepts the exact locked values", () => {
    const parsed = SettingsDataSchema.safeParse(validSettings());
    assert.ok(parsed.success, "locked contact values parse");
  });

  test("E1 contact settings: rejects an absent contact block", () => {
    const parsed = SettingsDataSchema.safeParse({
      siteTitle: "Ryan Brosas",
      navLabels: { about: "About", services: "Work With Me", contact: "Contact" },
    });
    assert.equal(parsed.success, false, "absent contact block must fail (contact is required)");
  });

  test("E1 contact settings: rejects a partial contact block", () => {
    const parsed = SettingsDataSchema.safeParse({
      ...validSettings(),
      contact: {
        schedulerUrl: lockedContact.schedulerUrl,
        emailFallback: lockedContact.emailFallback,
        // privacyRequired missing
      },
    });
    assert.equal(parsed.success, false, "partial contact block must fail");
  });

  test("E1 contact settings: rejects privacyRequired: true (M2 has no privacy route)", () => {
    const parsed = SettingsDataSchema.safeParse(
      validSettings({ ...lockedContact, privacyRequired: true }),
    );
    assert.equal(parsed.success, false, "privacyRequired: true must fail");
  });

  test("E1 contact settings: rejects unsafe scheduler URLs without throwing", () => {
    const unsafe = [
      "http://calendly.com/ryanjoserbrosas/30min",
      "ftp://calendly.com/ryanjoserbrosas/30min",
      "mailto:ryanjoserbrosas@gmail.com",
      "https://cal.com/ryanjoserbrosas/30min",
      "https://www.calendly.com/ryanjoserbrosas/30min",
      "https://calendly.com.evil.example/ryanjoserbrosas/30min",
      "not-a-url",
    ];
    for (const schedulerUrl of unsafe) {
      assert.doesNotThrow(
        () => {
          const parsed = SettingsDataSchema.safeParse(
            validSettings({ ...lockedContact, schedulerUrl }),
          );
          assert.equal(
            parsed.success,
            false,
            `unsafe scheduler URL must fail validation: ${schedulerUrl}`,
          );
        },
        undefined,
        `refine must not throw on malformed URL: ${schedulerUrl}`,
      );
    }
  });

  test("E1 contact settings: site.json envelope contains the locked contact and validates", () => {
    const settingsFile = JSON.parse(
      fs.readFileSync(
        path.resolve(import.meta.dirname, "..", "src", "content", "settings", "site.json"),
        "utf-8",
      ),
    );
    assert.ok(Object.hasOwn(settingsFile, "site"), "envelope has 'site' key (entry ID)");
    assert.deepEqual(
      settingsFile.site.contact,
      lockedContact,
      "site.json has the exact locked contact block",
    );
    const parsed = SettingsDataSchema.safeParse(settingsFile.site);
    assert.ok(parsed.success, "inner SettingsData validates against schema");
  });
});

describe("M2 route-visibility pipeline (A2)", () => {
  test("draft record produces no route", () => {
    const routes = resolveRoutes({ about: "draft" });
    assert.equal(
      routes.find((r) => r.path === "/about/"),
      undefined,
      "draft must not route",
    );
  });

  test("noindex record is routable but not discoverable", () => {
    const routes = resolveRoutes({ about: "noindex" });
    const about = routes.find((r) => r.path === "/about/");
    assert.ok(about, "noindex is routable");
    assert.equal(isDiscoverable(about.visibility), false, "noindex is not discoverable");
  });

  test("public record is routable and discoverable", () => {
    const routes = resolveRoutes({ about: "public" });
    const about = routes.find((r) => r.path === "/about/");
    assert.ok(about, "public is routable");
    assert.equal(isDiscoverable(about.visibility), true, "public is discoverable");
  });

  test("empty visibility map returns no routes", () => {
    const routes = resolveRoutes({});
    assert.equal(routes.length, 0, "no records = no routes");
  });

  test("mixed visibilities: only routable records appear (draft excluded)", () => {
    const routes = resolveRoutes({
      about: "public",
      services: "draft",
      contact: "noindex",
    });
    const paths = routes.map((r) => r.path).sort();
    assert.deepEqual(paths, ["/about/", "/contact/"], "draft excluded, public+noindex included");
  });

  test("sitemap from resolved routes includes only public (noindex excluded)", () => {
    const routes = resolveRoutes({
      about: "public",
      services: "draft",
      contact: "noindex",
    });
    const xml = renderSitemap(routes, "https://example.com");
    assert.ok(xml.includes("https://example.com/about/"), "public route in sitemap");
    assert.ok(!xml.includes("services"), "draft route not in sitemap");
    assert.ok(!xml.includes("contact"), "noindex route not in sitemap");
  });
});

describe("T3 routes and canonical helpers", () => {
  test("ROUTE_REGISTRY exposes the first-release route inventory", () => {
    const ids = ROUTE_REGISTRY.all()
      .map((r) => r.id)
      .sort();
    assert.deepEqual(ids, [
      "404",
      "about",
      "case-studies",
      "case-studies-slug",
      "contact",
      "home",
      "robots",
      "services",
      "sitemap",
    ]);
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

  test("robots.txt with inline comments on directives passes", () => {
    const goodRobots =
      "User-agent: * # all crawlers\n\nSitemap: https://example.com/sitemap.xml # primary\n";
    const dir = makeTempDist({ "sitemap.xml": emptyUrlset, "robots.txt": goodRobots });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.ok(result.ok, `expected ok: ${result.errors.join(", ")}`);
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

  test("canonical inside HTML comment is NOT detected", () => {
    const dir = makeTempDist({
      "probe/index.html": `<!DOCTYPE html><html><head><!-- <link rel="canonical" href="https://example.com/probe/"> --></head><body></body></html>`,
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

  test("sitemap with XML-escaped URL in loc is not a false leak", () => {
    const xml = renderSitemap([{ path: "/a&b/", visibility: "public" }], site);
    const dir = makeTempDist({
      "sitemap.xml": xml,
      "robots.txt": robots,
      "a&b/index.html": htmlWithCanonicals("https://example.com/a&b/"),
    });
    try {
      const result = verifyBuild({
        distDir: dir,
        site,
        expectedHtmlRoutes: ["/a&b/"],
        expectedDiscoverableRoutes: ["/a&b/"],
        expectedFileEndpoints: ["sitemap.xml", "robots.txt"],
        allowEmptySitemap: false,
      });
      assert.ok(result.ok, `expected ok: ${result.errors.join(", ")}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("M2 phase-aware verifier (A3)", () => {
  const site = "https://example.com";
  const emptyUrlset = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  const robots = "User-agent: *\n\nSitemap: https://example.com/sitemap.xml\n";

  const makeTempDist = (files) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-a3-"));
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

  test("missing expected public route in sitemap fails (bidirectional)", () => {
    const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/about/</loc></url></urlset>`;
    const dir = makeTempDist({
      "sitemap.xml": sitemap,
      "robots.txt": robots,
      "about/index.html": htmlWithCanonicals("https://example.com/about/"),
      "services/index.html": htmlWithCanonicals("https://example.com/services/"),
    });
    try {
      const result = verifyBuild({
        distDir: dir,
        site,
        expectedHtmlRoutes: ["/about/", "/services/"],
        expectedDiscoverableRoutes: ["/about/", "/services/"],
        expectedFileEndpoints: ["sitemap.xml", "robots.txt"],
        allowEmptySitemap: false,
      });
      assert.equal(result.ok, false, "missing /services/ in sitemap must fail");
      assert.ok(
        result.errors.some((e) => e.includes("missing") && e.includes("sitemap")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("duplicate <loc> in sitemap fails", () => {
    const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/about/</loc></url><url><loc>https://example.com/about/</loc></url></urlset>`;
    const dir = makeTempDist({
      "sitemap.xml": sitemap,
      "robots.txt": robots,
      "about/index.html": htmlWithCanonicals("https://example.com/about/"),
    });
    try {
      const result = verifyBuild({
        distDir: dir,
        site,
        expectedHtmlRoutes: ["/about/"],
        expectedDiscoverableRoutes: ["/about/"],
        expectedFileEndpoints: ["sitemap.xml", "robots.txt"],
        allowEmptySitemap: false,
      });
      assert.equal(result.ok, false, "duplicate <loc> must fail");
      assert.ok(
        result.errors.some((e) => e.includes("duplicate")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("allowed _astro/ CSS asset is accepted (not unexpected-file)", () => {
    const dir = makeTempDist({
      "sitemap.xml": emptyUrlset,
      "robots.txt": robots,
      "_astro/styles.abc123.css": "body { color: red; }",
    });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.ok(result.ok, `expected ok: ${result.errors.join(", ")}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("allowed _astro/ SVG asset is accepted", () => {
    const dir = makeTempDist({
      "sitemap.xml": emptyUrlset,
      "robots.txt": robots,
      "_astro/icon.abc.svg": "<svg></svg>",
    });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.ok(result.ok, `expected ok: ${result.errors.join(", ")}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("unexpected _astro/ HTML asset is rejected", () => {
    const dir = makeTempDist({
      "sitemap.xml": emptyUrlset,
      "robots.txt": robots,
      "_astro/sneaky.html": "<html></html>",
    });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("_astro") || e.includes("unexpected")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("unexpected _astro/ JS asset is rejected", () => {
    const dir = makeTempDist({
      "sitemap.xml": emptyUrlset,
      "robots.txt": robots,
      "_astro/bundle.js": "console.log(1)",
    });
    try {
      const result = verifyBuild(rootManifest(dir));
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some((e) => e.includes("_astro") || e.includes("unexpected")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("discoverable route without corresponding HTML route fails (orphan)", () => {
    const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/ghost/</loc></url></urlset>`;
    const dir = makeTempDist({ "sitemap.xml": sitemap, "robots.txt": robots });
    try {
      const result = verifyBuild({
        distDir: dir,
        site,
        expectedHtmlRoutes: [],
        expectedDiscoverableRoutes: ["/ghost/"],
        expectedFileEndpoints: ["sitemap.xml", "robots.txt"],
        allowEmptySitemap: false,
      });
      assert.equal(result.ok, false, "orphan discoverable route must fail");
      assert.ok(
        result.errors.some((e) => e.includes("ghost")),
        `errors: ${result.errors.join(", ")}`,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("verifier is read-only with _astro/ assets present", () => {
    const dir = makeTempDist({
      "sitemap.xml": emptyUrlset,
      "robots.txt": robots,
      "_astro/styles.css": "body {}",
    });
    try {
      const before = snapshotTree(dir);
      verifyBuild(rootManifest(dir));
      const after = snapshotTree(dir);
      assert.deepEqual(after, before, "dist unchanged after verify");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("M2 slug override regression (real glob loader)", () => {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const fixtureRoot = path.resolve(import.meta.dirname, "fixtures", "slug-loader");
  const fixtureDist = path.join(fixtureRoot, "dist");
  const astroBin = path.join(repoRoot, "node_modules", ".bin", "astro");

  test("about.md with frontmatter slug:bio loads as ID about, not bio", () => {
    fs.rmSync(fixtureDist, { recursive: true, force: true });
    try {
      const result = spawnSync(astroBin, ["build", "--root", fixtureRoot], {
        cwd: repoRoot,
        encoding: "utf-8",
      });
      assert.equal(result.status, 0, `astro build failed: ${result.stderr}`);
      const html = fs.readFileSync(path.join(fixtureDist, "dump", "index.html"), "utf-8");
      // Custom generateId derives ID from filename; frontmatter slug is ignored.
      assert.ok(html.includes('data-id="about"'), "entry ID must be filename-derived 'about'");
      assert.ok(
        !html.includes('data-id="bio"'),
        "frontmatter slug 'bio' must not become the entry ID",
      );
    } finally {
      fs.rmSync(fixtureDist, { recursive: true, force: true });
    }
  });
});

describe("C1 markdown safety", () => {
  // --- Unit tests: the plugin function throws on each violation class ---

  test("throws on a raw hast node (raw HTML)", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [{ type: "raw", value: "<script>alert(1)</script>" }],
    };
    assert.throws(() => transform(tree), /raw-html/);
  });

  test("throws on case-insensitive on* event properties", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "img",
          properties: { onerror: "alert(1)" },
          children: [],
        },
      ],
    };
    assert.throws(() => transform(tree), /event-handler/);
  });

  test("throws on ONERROR (uppercase event property)", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "img",
          properties: { ONERROR: "alert(1)" },
          children: [],
        },
      ],
    };
    assert.throws(() => transform(tree), /event-handler/);
  });

  test("throws on javascript: protocol in href", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "javascript:alert(1)" },
          children: [],
        },
      ],
    };
    assert.throws(() => transform(tree), /unsafe-protocol/);
  });

  test("throws on data: protocol in src", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "img",
          properties: { src: "data:text/html,<script>alert(1)</script>" },
          children: [],
        },
      ],
    };
    assert.throws(() => transform(tree), /unsafe-protocol/);
  });

  test("throws on javascript: with whitespace prefix in href", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "  javascript:alert(1)" },
          children: [],
        },
      ],
    };
    assert.throws(() => transform(tree), /unsafe-protocol/);
  });

  test("passes safe relative links", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "/about/" },
          children: [],
        },
      ],
    };
    assert.doesNotThrow(() => transform(tree));
  });

  test("passes safe fragment links", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "#section" },
          children: [],
        },
      ],
    };
    assert.doesNotThrow(() => transform(tree));
  });

  test("passes safe https links", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "https://example.com/page" },
          children: [],
        },
      ],
    };
    assert.doesNotThrow(() => transform(tree));
  });

  test("passes safe protocol-relative links", () => {
    const transform = markdownSafety();
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "//example.com/page" },
          children: [],
        },
      ],
    };
    assert.doesNotThrow(() => transform(tree));
  });

  test("assertMarkdownRendered throws when rendered.html is missing", () => {
    assert.throws(() => assertMarkdownRendered({ rendered: undefined }), /render-failed/);
  });

  test("assertMarkdownRendered passes when rendered.html is a string", () => {
    assert.doesNotThrow(() => assertMarkdownRendered({ rendered: { html: "<p>safe</p>" } }));
  });

  // --- Production-chain fixture: proves root config registration + glob +
  // assertMarkdownRendered wiring. Builds via --config ../../../astro.config.mjs
  // so the ROOT production markdown.rehypePlugins is exercised, not a fixture
  // config. The test fails if either production registration or assertion
  // wiring is removed.

  test("production chain: unsafe markdown fails the build", () => {
    const fixtureSrc = path.resolve(import.meta.dirname, "fixtures", "markdown-safety");
    const tempRoot = fs.mkdtempSync(path.join(import.meta.dirname, "fixtures", ".md-safety-"));
    try {
      // Assert temp root stays inside the repo (node_modules resolution).
      const repoRoot = path.resolve(import.meta.dirname, "..");
      assert.ok(
        path.relative(repoRoot, tempRoot).startsWith("..") === false,
        "temp root must stay inside the repo",
      );

      // Copy fixture src/ into temp root.
      fs.cpSync(path.join(fixtureSrc, "src"), path.join(tempRoot, "src"), { recursive: true });

      // Write temp content.config.ts mirroring production pages loader.
      fs.writeFileSync(
        path.join(tempRoot, "src", "content.config.ts"),
        `import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { PageSchema } from "../../../../src/lib/content-schemas.ts";

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/pages",
    generateId: ({ entry }) => entry.replace(/\\.[^.]+$/, ""),
  }),
  schema: PageSchema,
});

export const collections = { pages };
`,
      );

      const astroBin = path.join(repoRoot, "node_modules", ".bin", "astro");
      const result = spawnSync(
        astroBin,
        ["build", "--root", tempRoot, "--config", "../../../astro.config.mjs"],
        { cwd: repoRoot, encoding: "utf-8" },
      );

      // Unsafe markdown must fail the build (guard throws -> glob catches ->
      // rendered:undefined -> probe's assertMarkdownRendered throws).
      assert.notEqual(result.status, 0, "unsafe markdown build must fail");
      assert.ok(
        result.stderr.includes("render-failed") ||
          result.stdout.includes("render-failed") ||
          result.stderr.includes("raw-html") ||
          result.stdout.includes("raw-html") ||
          result.stderr.includes("unsafe-protocol") ||
          result.stdout.includes("unsafe-protocol") ||
          result.stderr.includes("event-handler") ||
          result.stdout.includes("event-handler"),
        `build must report a markdown-safety error; got stderr: ${result.stderr.slice(0, 500)}`,
      );
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  test("production chain: safe markdown builds successfully", () => {
    const fixtureSrc = path.resolve(import.meta.dirname, "fixtures", "markdown-safety");
    const tempRoot = fs.mkdtempSync(path.join(import.meta.dirname, "fixtures", ".md-safety-"));
    try {
      const repoRoot = path.resolve(import.meta.dirname, "..");
      fs.cpSync(path.join(fixtureSrc, "src"), path.join(tempRoot, "src"), { recursive: true });

      // Overwrite the copied unsafe.md with safe content (never mutate tracked fixture).
      fs.writeFileSync(
        path.join(tempRoot, "src", "content", "pages", "unsafe.md"),
        `---
title: "Safe"
description: "Safe test page"
visibility: draft
---

A safe paragraph with a [normal link](/about/).
`,
      );

      fs.writeFileSync(
        path.join(tempRoot, "src", "content.config.ts"),
        `import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { PageSchema } from "../../../../src/lib/content-schemas.ts";

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/pages",
    generateId: ({ entry }) => entry.replace(/\\.[^.]+$/, ""),
  }),
  schema: PageSchema,
});

export const collections = { pages };
`,
      );

      const astroBin = path.join(repoRoot, "node_modules", ".bin", "astro");
      const result = spawnSync(
        astroBin,
        ["build", "--root", tempRoot, "--config", "../../../astro.config.mjs"],
        { cwd: repoRoot, encoding: "utf-8" },
      );

      assert.equal(
        result.status,
        0,
        `safe markdown build must succeed; stderr: ${result.stderr.slice(0, 500)}`,
      );
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("T6 content data models", () => {
  const seo = {
    title: "Reliable AI workflow systems",
    description: "Proof-backed agent workflows for founders and operators.",
  };
  const validCaseStudy = {
    ...seo,
    visibility: "public",
    owner: "ryan",
    kind: "case-study",
    slug: "agent-reliability-audit",
    pillar: "ai-workflow-systems",
  };

  test("CaseStudyRecord accepts a valid public record", () => {
    const r = CaseStudyRecordSchema.safeParse(validCaseStudy);
    assert.equal(r.success, true, r.success ? "" : JSON.stringify(r.error.issues));
  });

  test("CaseStudyRecord rejects a record missing slug", () => {
    const { slug, ...withoutSlug } = validCaseStudy;
    assert.equal(CaseStudyRecordSchema.safeParse(withoutSlug).success, false);
  });

  test("CaseStudyRecord rejects an invalid visibility value", () => {
    assert.equal(
      CaseStudyRecordSchema.safeParse({ ...validCaseStudy, visibility: "listed" }).success,
      false,
    );
  });

  test("CaseStudyRecord defaults visibility to draft (fail-closed) when omitted", () => {
    const { visibility, ...withoutVisibility } = validCaseStudy;
    const r = CaseStudyRecordSchema.safeParse(withoutVisibility);
    assert.equal(r.success, true, r.success ? "" : JSON.stringify(r.error.issues));
    assert.equal(r.data.visibility, "draft");
  });

  test("CaseStudyRecord requires a known topic pillar", () => {
    const { pillar, ...withoutPillar } = validCaseStudy;
    assert.equal(CaseStudyRecordSchema.safeParse(withoutPillar).success, false);
    assert.equal(
      CaseStudyRecordSchema.safeParse({ ...validCaseStudy, pillar: "unknown-pillar" }).success,
      false,
    );
  });

  test("ServiceRecord requires title and description", () => {
    const base = { visibility: "public", owner: "ryan", kind: "service", slug: "workflow-audit" };
    assert.equal(ServiceRecordSchema.safeParse(base).success, false);
    assert.equal(ServiceRecordSchema.safeParse({ ...base, ...seo }).success, true);
  });

  test("PublicationRecord requires owner to be 'ryan'", () => {
    assert.equal(PublicationRecordSchema.safeParse({ visibility: "public" }).success, false);
    assert.equal(
      PublicationRecordSchema.safeParse({ visibility: "public", owner: "ryan" }).success,
      true,
    );
    assert.equal(
      PublicationRecordSchema.safeParse({ visibility: "public", owner: "someone" }).success,
      false,
    );
  });

  test("SeoFields rejects canonicalOverride outside the code-owned allowlist", () => {
    assert.equal(
      SeoFieldsSchema.safeParse({ ...seo, canonicalOverride: "https://example.com/impostor" })
        .success,
      false,
    );
    assert.equal(SeoFieldsSchema.safeParse(seo).success, true);
  });

  test("TopicFields requires a known pillar", () => {
    assert.equal(TopicFieldsSchema.safeParse({ pillar: "unknown" }).success, false);
    assert.equal(TopicFieldsSchema.safeParse({ pillar: "agent-reliability" }).success, true);
  });
});
