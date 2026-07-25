// W4·T16 (SEO/GEO authority refactor) — homepage proof-gate unit tests.
// The pure `homepageProofGate` is the machine-executable promotion gate: it must
// be ALL-true before `/` (ROOT_ROUTE_POLICY) flips from noindex to public. These
// tests exercise the gate in BOTH directions in-process (public when the
// self-project case study is public with verified, resolvable evidence and every
// homepage claim carries an evidence ref; noindex otherwise) — separate from the
// filesystem-backed `resolveHomeVisibility` edge loader, which the real build +
// verifier + the shell suite's draft-flip QA scenario cover.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { homepageProofGate, resolveHomeVisibility } from "../src/lib/home-proof.ts";
import { ROOT_ROUTE_POLICY } from "../src/config/routes.ts";

// The one approved public-safe source (mirror of src/data/sources.json).
const SOURCES = {
  "source-self-project-build-001": {
    id: "source-self-project-build-001",
    title: "This website's static build and public source repository",
    type: "approved-artifact",
    owner: "ryan",
    permission: "public",
    reviewedAt: "2026-07-25T00:00:00.000Z",
  },
};

// The homepage's only approved factual claim (mirror of SELF_PROJECT_CLAIMS).
const CLAIMS = [
  {
    id: "claim-self-project-static-build-001",
    statement:
      "This website is built as static output and served from a publicly inspectable source repository.",
    kind: "fact",
    sourceIds: ["source-self-project-build-001"],
    status: "approved",
  },
];

// The self-project case study projection the gate needs: public + verified
// evidence resolving to the approved source.
const publicCaseStudy = {
  visibility: "public",
  evidence: { kind: "verified", sourceId: "source-self-project-build-001" },
};

describe("homepageProofGate — pure promotion gate (both directions)", () => {
  test("PROMOTES / to public when the case study is public with verified, resolvable evidence and every claim carries an evidence ref", () => {
    const r = homepageProofGate({ caseStudy: publicCaseStudy, sources: SOURCES, claims: CLAIMS });
    assert.equal(r.promoted, true, "gate promotes");
    assert.equal(r.visibility, "public", "home becomes public");
    assert.equal(
      r.promoted ? r.sourceId : "",
      "source-self-project-build-001",
      "gate reports the backing sourceId",
    );
  });

  test("KEEPS / noindex when the case study is absent", () => {
    const r = homepageProofGate({ caseStudy: undefined, sources: SOURCES, claims: CLAIMS });
    assert.equal(r.promoted, false);
    assert.equal(r.visibility, "noindex");
    assert.equal(r.promoted ? "" : r.reason, "case-study-absent");
  });

  test("KEEPS / noindex when the case study is not public (draft)", () => {
    const r = homepageProofGate({
      caseStudy: { ...publicCaseStudy, visibility: "draft" },
      sources: SOURCES,
      claims: CLAIMS,
    });
    assert.equal(r.promoted, false);
    assert.equal(r.visibility, "noindex");
    assert.equal(r.promoted ? "" : r.reason, "case-study-not-public");
  });

  test("KEEPS / noindex when the evidence is not kind:'verified'", () => {
    const r = homepageProofGate({
      caseStudy: { visibility: "public", evidence: { kind: "proposed", sourceId: "" } },
      sources: SOURCES,
      claims: CLAIMS,
    });
    assert.equal(r.promoted, false);
    assert.equal(r.visibility, "noindex");
  });

  test("KEEPS / noindex when the evidence sourceId is absent from the source registry", () => {
    const r = homepageProofGate({
      caseStudy: { visibility: "public", evidence: { kind: "verified", sourceId: "source-nope" } },
      sources: SOURCES,
      claims: CLAIMS,
    });
    assert.equal(r.promoted, false);
    assert.equal(r.visibility, "noindex");
  });

  test("KEEPS / noindex when the resolved source has an empty label", () => {
    const r = homepageProofGate({
      caseStudy: publicCaseStudy,
      sources: {
        "source-self-project-build-001": {
          ...SOURCES["source-self-project-build-001"],
          title: "   ",
        },
      },
      claims: CLAIMS,
    });
    assert.equal(r.promoted, false);
    assert.equal(r.visibility, "noindex");
    assert.equal(r.promoted ? "" : r.reason, "source-missing-label");
  });

  test("KEEPS / noindex when the backing source is internal-only (cannot back a public claim)", () => {
    const r = homepageProofGate({
      caseStudy: publicCaseStudy,
      sources: {
        "source-self-project-build-001": {
          ...SOURCES["source-self-project-build-001"],
          permission: "internal-only",
        },
      },
      claims: CLAIMS,
    });
    assert.equal(r.promoted, false);
    assert.equal(r.visibility, "noindex");
  });

  test("KEEPS / noindex when a homepage claim lacks a resolvable evidence ref", () => {
    const badClaims = [{ ...CLAIMS[0], sourceIds: [] }];
    const r = homepageProofGate({
      caseStudy: publicCaseStudy,
      sources: SOURCES,
      claims: badClaims,
    });
    assert.equal(r.promoted, false);
    assert.equal(r.visibility, "noindex");
  });

  test("KEEPS / noindex when there are no homepage claims to back the positioning", () => {
    const r = homepageProofGate({ caseStudy: publicCaseStudy, sources: SOURCES, claims: [] });
    assert.equal(r.promoted, false);
    assert.equal(r.visibility, "noindex");
  });
});

describe("resolveHomeVisibility + ROOT_ROUTE_POLICY — real repo wiring", () => {
  test("resolveHomeVisibility promotes to public against the real repo content", () => {
    assert.equal(resolveHomeVisibility(), "public");
  });

  test("ROOT_ROUTE_POLICY.visibility reflects the gate result (public)", () => {
    assert.equal(ROOT_ROUTE_POLICY.visibility, "public");
  });
});
