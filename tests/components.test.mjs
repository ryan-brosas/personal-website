// T12 (shared authority components) — verifies the pure decision seam that the
// Byline / EvidenceNote / FreshnessNotice / RelatedContent .astro components
// consume (src/components/authority.ts). The seam DELEGATES to the T7/T8 policy
// kernels (entities/evidence/freshness/relationships) and never reimplements
// claim, freshness, or relationship logic — so these tests assert the exact
// render decisions each component makes, without needing an Astro runtime.
//
// Runs as pure Node (no Astro). Imports the .ts seam directly via ESM-native
// TypeScript resolution (same as the other policy tests).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bylinePerson,
  evidenceSources,
  freshnessDate,
  relatedRefs,
} from "../src/components/authority.ts";

// Public-safe registry with one public source and one internal-only source.
const REGISTRY = {
  "src-public": {
    id: "src-public",
    title: "Public artifact",
    type: "approved-artifact",
    owner: "ryan",
    permission: "public",
    reviewedAt: "2026-07-25T00:00:00.000Z",
  },
  "src-internal": {
    id: "src-internal",
    title: "Internal note",
    type: "operator-observation",
    owner: "ryan",
    permission: "internal-only",
    reviewedAt: "2026-07-25T00:00:00.000Z",
  },
};

const approvedClaim = {
  id: "c-approved",
  statement: "Static build served from a public repo.",
  kind: "fact",
  sourceIds: ["src-public"],
  status: "approved",
};
const blockedClaim = { ...approvedClaim, id: "c-blocked", status: "blocked" };
const retiredClaim = { ...approvedClaim, id: "c-retired", status: "retired" };
const internalOnlyClaim = { ...approvedClaim, id: "c-internal", sourceIds: ["src-internal"] };

describe("authority — Byline", () => {
  it("renders the single ryan-brosas author entity", () => {
    const person = bylinePerson();
    assert.equal(person.id, "ryan-brosas");
    assert.equal(person.name, "Ryan Brosas");
  });
});

describe("authority — EvidenceNote", () => {
  it("renders the public source refs of an approved claim", () => {
    const sources = evidenceSources(approvedClaim, REGISTRY);
    assert.equal(sources.length, 1);
    assert.equal(sources[0].title, "Public artifact");
  });
  it("renders NOTHING for a blocked claim", () => {
    assert.deepEqual(evidenceSources(blockedClaim, REGISTRY), []);
  });
  it("renders NOTHING for a retired claim", () => {
    assert.deepEqual(evidenceSources(retiredClaim, REGISTRY), []);
  });
  it("renders NOTHING when a public claim is backed only by an internal-only source", () => {
    assert.deepEqual(evidenceSources(internalOnlyClaim, REGISTRY), []);
  });
});

describe("authority — FreshnessNotice", () => {
  const dates = { modifiedAt: "2026-01-01T00:00:00.000Z" };
  const now = "2026-07-25T00:00:00.000Z";
  it("shows the bumped date for a substantive change", () => {
    assert.equal(freshnessDate(dates, "body-text", now), now);
  });
  it("shows NOTHING for a trivial typo-fix change", () => {
    assert.equal(freshnessDate(dates, "typo-fix", now), undefined);
  });
  it("shows NOTHING for a formatting-only change", () => {
    assert.equal(freshnessDate(dates, "formatting", now), undefined);
  });
});

describe("authority — RelatedContent", () => {
  const collections = {
    "case-studies": [
      { id: "shipped", visibility: "public" },
      { id: "wip", visibility: "noindex" },
      { id: "secret", visibility: "draft" },
    ],
  };
  it("keeps refs whose target is public", () => {
    const out = relatedRefs([{ collection: "case-studies", id: "shipped" }], collections);
    assert.equal(out.length, 1);
    assert.equal(out[0].id, "shipped");
  });
  it("drops a noindex target → empty (renders nothing)", () => {
    assert.deepEqual(relatedRefs([{ collection: "case-studies", id: "wip" }], collections), []);
  });
  it("drops a draft or unresolvable target → empty", () => {
    assert.deepEqual(relatedRefs([{ collection: "case-studies", id: "secret" }], collections), []);
    assert.deepEqual(relatedRefs([{ collection: "missing", id: "x" }], collections), []);
  });
});
