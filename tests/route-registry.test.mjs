// W1·T2 — unit tests for the route-registry kernel: validateRegistry edge cases
// (fail-fast invariants) plus the derived helpers on the real ROUTE_REGISTRY.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { defineRoutes, validateRegistry } from "../src/lib/route-registry.ts";
import { ROUTE_REGISTRY } from "../src/config/routes.ts";

// Minimal valid base a test can clone and then corrupt one field at a time.
const singleton = (over = {}) => ({
  id: "about",
  kind: "singleton",
  path: "/about/",
  visibility: "public",
  gate: "always",
  navPlacement: "none",
  ...over,
});

describe("validateRegistry invariants (fail-fast)", () => {
  test("accepts a well-formed inventory", () => {
    assert.doesNotThrow(() =>
      validateRegistry([
        singleton(),
        singleton({ id: "services", path: "/services/" }),
        {
          id: "sitemap",
          kind: "file",
          path: "/sitemap.xml",
          visibility: "public",
          gate: "always",
          navPlacement: "none",
          isEndpoint: true,
        },
      ]),
    );
  });

  test("throws on duplicate route id", () => {
    assert.throws(
      () => validateRegistry([singleton(), singleton({ path: "/other/" })]),
      /duplicate route id "about"/,
    );
  });

  test("throws on duplicate route path", () => {
    assert.throws(
      () => validateRegistry([singleton(), singleton({ id: "dup" })]),
      /duplicate route path "\/about\/"/,
    );
  });

  test("throws on HTML route missing a trailing slash", () => {
    assert.throws(
      () => validateRegistry([singleton({ path: "/about" })]),
      /must have a trailing slash/,
    );
  });

  test("throws on file endpoint WITH a trailing slash", () => {
    assert.throws(
      () =>
        validateRegistry([
          {
            id: "sitemap",
            kind: "file",
            path: "/sitemap.xml/",
            visibility: "public",
            gate: "always",
            navPlacement: "none",
            isEndpoint: true,
          },
        ]),
      /must not have a trailing slash/,
    );
  });

  test("throws on a missing parent reference", () => {
    assert.throws(
      () => validateRegistry([singleton({ id: "child", path: "/child/", parent: "ghost" })]),
      /references missing parent "ghost"/,
    );
  });

  test("throws on a malformed dynamic pattern (no [param] segment)", () => {
    assert.throws(
      () => validateRegistry([singleton({ id: "dyn", path: "/dyn/", isDynamic: true })]),
      /malformed pattern/,
    );
  });

  test("throws when a primary-nav route omits navLabelKey", () => {
    assert.throws(
      () => validateRegistry([singleton({ navPlacement: "primary" })]),
      /must declare a navLabelKey/,
    );
  });

  test("T2: throws when a primary-nav route targets a non-public (draft) route", () => {
    // nav-without-public — a nav entry pointing at a draft route (which emits no
    // route) is a dangling link and must fail fast.
    assert.throws(
      () =>
        validateRegistry([
          singleton({ navPlacement: "primary", navLabelKey: "about", visibility: "draft" }),
        ]),
      /must target a public-capable route/,
    );
  });

  test("T2: throws when a route references a non-implemented gate", () => {
    // gate-without-impl — a reserved-but-unbuilt gate would silently never
    // promote; the registry rejects it at construction time.
    assert.throws(
      () => validateRegistry([singleton({ gate: "llms-experiment" })]),
      /non-implemented gate "llms-experiment"/,
    );
  });

  test("defineRoutes validates at construction (throws on bad input)", () => {
    assert.throws(() => defineRoutes([singleton(), singleton()]), /duplicate route id/);
  });
});

describe("ROUTE_REGISTRY derived helpers", () => {
  test("pathFor returns the static path for a singleton", () => {
    assert.equal(ROUTE_REGISTRY.pathFor("about"), "/about/");
  });

  test("pathFor substitutes a dynamic [slug] segment", () => {
    assert.equal(
      ROUTE_REGISTRY.pathFor("case-studies-slug", { slug: "example" }),
      "/case-studies/example/",
    );
  });

  test("pathFor throws when a required dynamic param is missing", () => {
    assert.throws(() => ROUTE_REGISTRY.pathFor("case-studies-slug"), /missing route param "slug"/);
  });

  test("canonicalFor joins origin + trailing-slash canonical (INV-01)", () => {
    assert.equal(
      ROUTE_REGISTRY.canonicalFor("case-studies-slug", { slug: "example" }, "https://example.com"),
      "https://example.com/case-studies/example/",
    );
  });

  test("canonicalFor keeps file endpoints slashless (INV-02)", () => {
    assert.equal(
      ROUTE_REGISTRY.canonicalFor("sitemap", undefined, "https://example.com"),
      "https://example.com/sitemap.xml",
    );
  });

  test("navItems yields the primary order with case-studies slotted (T14)", () => {
    // T14 promotes case-studies to primary nav at navOrder 25 — between
    // services (20) and contact (30), preserving the shipped about/services/contact
    // order around it.
    assert.deepEqual(
      ROUTE_REGISTRY.navItems().map((r) => r.id),
      ["about", "services", "case-studies", "contact"],
    );
  });

  test("navItems includes the T14 case-studies hub but never the code-owned root", () => {
    const ids = ROUTE_REGISTRY.navItems().map((r) => r.id);
    assert.ok(!ids.includes("home"), "home is not a nav item");
    assert.ok(ids.includes("case-studies"), "case-studies is navigable as of T14");
  });

  test("parentFor resolves the hub for the collection route", () => {
    assert.equal(ROUTE_REGISTRY.parentFor("case-studies-slug")?.id, "case-studies");
    assert.equal(ROUTE_REGISTRY.parentFor("about"), undefined);
  });

  test("breadcrumbsFor builds hub→leaf trail and suppresses home", () => {
    assert.deepEqual(ROUTE_REGISTRY.breadcrumbsFor("case-studies-slug", { slug: "example" }), [
      { id: "case-studies", path: "/case-studies/" },
      { id: "case-studies-slug", path: "/case-studies/example/" },
    ]);
    assert.deepEqual(ROUTE_REGISTRY.breadcrumbsFor("about"), [{ id: "about", path: "/about/" }]);
  });

  test("discoverableRoutes = public, non-dynamic, HTML only (home included once gate-promoted; no endpoints/slug)", () => {
    const paths = ROUTE_REGISTRY.discoverableRoutes()
      .map((r) => r.path)
      .sort();
    // The homepage "/" is gate-promoted to public (T16), so it now joins the
    // discoverable set; file endpoints and the dynamic [slug] pattern stay out.
    assert.deepEqual(paths, ["/", "/about/", "/case-studies/", "/contact/", "/services/"]);
  });

  test("expectedBuildManifest lists static route paths, excludes the dynamic pattern", () => {
    const paths = ROUTE_REGISTRY.expectedBuildManifest();
    assert.ok(paths.includes("/"), "root is a declared build target");
    assert.ok(paths.includes("/sitemap.xml"), "endpoints are declared build targets");
    assert.ok(
      !paths.includes("/case-studies/[slug]/"),
      "dynamic collection pattern is not a static build target",
    );
  });
});
