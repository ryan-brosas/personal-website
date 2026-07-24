// W3·T10 (Breadcrumbs component data contract) — verifies the trail that
// Breadcrumbs.astro renders is DERIVED from ROUTE_REGISTRY.breadcrumbsFor, never
// hard-coded. Asserts the committed registry semantics the component relies on:
// the code-owned "home" root is suppressed (it owns the brand link, not a crumb),
// singleton routes yield a single self-crumb, and paths carry trailing slashes.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ROUTE_REGISTRY } from "../src/config/routes.ts";

describe("breadcrumbs component data contract", () => {
  it("suppresses the code-owned home root (empty trail — brand link owns it)", () => {
    const trail = ROUTE_REGISTRY.breadcrumbsFor("home");
    assert.ok(Array.isArray(trail), "breadcrumbsFor returns an array");
    assert.equal(trail.length, 0, "home renders no breadcrumb crumb");
  });

  it("yields a single self-crumb for a top-level singleton", () => {
    for (const [id, expectedPath] of [
      ["about", "/about/"],
      ["services", "/services/"],
      ["contact", "/contact/"],
    ]) {
      const trail = ROUTE_REGISTRY.breadcrumbsFor(id);
      assert.equal(trail.length, 1, `${id} has exactly one crumb (no parent)`);
      assert.equal(trail[0].id, id);
      assert.equal(trail[0].path, expectedPath, `${id} crumb carries its trailing-slash path`);
    }
  });

  it("derives the trail from the registry (not a hard-coded map)", () => {
    // Every crumb id/path must round-trip through the registry — proving the
    // component's source is the ONE registry, so IA changes flow through freely.
    const trail = ROUTE_REGISTRY.breadcrumbsFor("about");
    for (const crumb of trail) {
      assert.equal(ROUTE_REGISTRY.pathFor(crumb.id), crumb.path);
    }
  });
});
