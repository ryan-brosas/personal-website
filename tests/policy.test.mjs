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
} from "../src/lib/publishing.ts";

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
