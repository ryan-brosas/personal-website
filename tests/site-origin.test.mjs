// W1·T3 / INV-12 — production origin guard. astro.config.mjs delegates its
// SITE_ORIGIN resolution to the pure `resolveSiteOrigin` so the "real production
// build" throw is testable without spawning astro (Vite forces NODE_ENV=production
// in ALL builds incl `node --test`, so NODE_ENV is not a usable signal; a dedicated
// PRODUCTION_BUILD env var is the production intent).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resolveSiteOrigin, PLACEHOLDER_ORIGIN } from "../src/lib/site-origin.ts";

describe("resolveSiteOrigin — INV-12 production origin guard", () => {
  test("PRODUCTION_BUILD=true + no SITE_ORIGIN → throws (absent origin rejected)", () => {
    assert.throws(() => resolveSiteOrigin({ PRODUCTION_BUILD: "true" }), /SITE_ORIGIN/);
  });

  test("PRODUCTION_BUILD=true + placeholder SITE_ORIGIN → throws", () => {
    assert.throws(
      () => resolveSiteOrigin({ PRODUCTION_BUILD: "true", SITE_ORIGIN: PLACEHOLDER_ORIGIN }),
      /SITE_ORIGIN/,
    );
  });

  test("PRODUCTION_BUILD=true + real SITE_ORIGIN → returns it (OK)", () => {
    assert.equal(
      resolveSiteOrigin({ PRODUCTION_BUILD: "true", SITE_ORIGIN: "https://ryanjosebrosas.dev" }),
      "https://ryanjosebrosas.dev",
    );
  });

  test("no PRODUCTION_BUILD + no SITE_ORIGIN → falls back to placeholder, no throw (dev/test)", () => {
    assert.equal(resolveSiteOrigin({}), PLACEHOLDER_ORIGIN);
  });

  test("no PRODUCTION_BUILD + explicit placeholder SITE_ORIGIN → still throws (operator copy-paste guard)", () => {
    assert.throws(() => resolveSiteOrigin({ SITE_ORIGIN: PLACEHOLDER_ORIGIN }), /placeholder/);
  });

  test("no PRODUCTION_BUILD + real SITE_ORIGIN → returns it (preview/dev with real origin)", () => {
    assert.equal(
      resolveSiteOrigin({ SITE_ORIGIN: "https://ryanjosebrosas.dev" }),
      "https://ryanjosebrosas.dev",
    );
  });
});
