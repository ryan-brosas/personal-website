// W3·T9 (SEO/GEO authority refactor) — metadata builder unit contract.
// buildPageMetadata is the single source of a page's SEO head: it derives the
// canonical URL from ROUTE_REGISTRY (never a free-form string), derives noindex
// from the route's registry visibility, lets explicit overrides win, and
// parameterizes the OG block. Pure module — Node-testable, no astro runtime.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildPageMetadata } from "../src/lib/metadata.ts";

describe("T9 buildPageMetadata", () => {
  test("derives canonical from ROUTE_REGISTRY (trailing-slash HTML route)", () => {
    const meta = buildPageMetadata("about", { title: "About", description: "d" });
    assert.equal(meta.canonical, "https://example.com/about/");
  });

  test("derives slashless canonical for a file endpoint", () => {
    const meta = buildPageMetadata("404", { title: "404", description: "d" });
    assert.equal(meta.canonical, "https://example.com/404.html");
  });

  test("noindex is derived from registry visibility when not overridden", () => {
    // home is gate-promoted to public (T16) and about is public — both derive
    // noindex=false straight from their registry visibility (no override). The
    // noindex=true derivation is exercised by the override test below and the C2
    // content-driven-noindex build variant (no registry route is static noindex).
    assert.equal(buildPageMetadata("home").noindex, false);
    assert.equal(buildPageMetadata("about").noindex, false);
  });

  test("explicit noindex override wins over registry visibility", () => {
    // 404 is 'public' in the registry but must render noindex,follow.
    assert.equal(buildPageMetadata("404", { noindex: true }).noindex, true);
    // A public route can be forced noindex (content-driven), per [page].astro.
    assert.equal(buildPageMetadata("about", { noindex: true }).noindex, true);
  });

  test("title/description flow through and default the OG block", () => {
    const meta = buildPageMetadata("services", {
      title: "Services",
      description: "What I do",
    });
    assert.equal(meta.title, "Services");
    assert.equal(meta.description, "What I do");
    assert.equal(meta.og.title, "Services");
    assert.equal(meta.og.description, "What I do");
    assert.equal(meta.og.image, undefined);
  });

  test("throws on an unknown route id (fail-fast)", () => {
    assert.throws(() => buildPageMetadata("does-not-exist"), /unknown route id/);
  });
});
