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
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { homepageProofGate, resolveHomeVisibility, homepageVerifiedClaims } from "../src/lib/home-proof.ts";
import { ROOT_ROUTE_POLICY } from "../src/config/routes.ts";
import { SELF_PROJECT_CLAIMS } from "../src/config/entities.ts";
import { resolvePublicClaim } from "../src/lib/evidence.ts";
import sourcesJson from "../src/data/sources.json" with { type: "json" };

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

  test("proof resolution is independent of process.cwd()", () => {
    const moduleUrl = new URL("../src/lib/home-proof.ts", import.meta.url).href;
    const result = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        `import { resolveHomeVisibility } from ${JSON.stringify(moduleUrl)}; console.log(resolveHomeVisibility());`,
      ],
      { cwd: tmpdir(), encoding: "utf-8" },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), "public");
  });
});

describe("T16 — homepage rendered claims are reconciled with SELF_PROJECT_CLAIMS", () => {
  const registry = sourcesJson;
  const claimIds = new Set(SELF_PROJECT_CLAIMS.map((c) => c.id));

  test("homepageVerifiedClaims() renders at least one positioning claim", () => {
    assert.ok(homepageVerifiedClaims(registry).length > 0, "the promoted homepage stands on ≥1 claim");
  });

  test("every homepage-rendered claim is PRESENT in SELF_PROJECT_CLAIMS", () => {
    for (const claim of homepageVerifiedClaims(registry)) {
      assert.ok(
        claimIds.has(claim.id),
        `rendered claim ${claim.id} must be a validated SELF_PROJECT_CLAIMS entry`,
      );
    }
  });

  test("every homepage-rendered claim RESOLVES to a public-safe source (evidence-backed)", () => {
    for (const claim of homepageVerifiedClaims(registry)) {
      assert.equal(
        resolvePublicClaim(claim, registry).ok,
        true,
        `rendered claim ${claim.id} must resolve against sources.json`,
      );
    }
  });

  test("rendered set == full validated set when every seeded claim resolves (no unbacked drift)", () => {
    // With the real public-safe registry, every SELF_PROJECT_CLAIMS entry resolves,
    // so the homepage renders the WHOLE validated set — rendered claims and
    // validated claims are the same set, the T16 reconciliation.
    assert.deepEqual(
      homepageVerifiedClaims(registry)
        .map((c) => c.id)
        .sort(),
      SELF_PROJECT_CLAIMS.map((c) => c.id).sort(),
    );
  });

  test("an unresolvable claim is DROPPED from the rendered set (fail-closed copy)", () => {
    // With an EMPTY registry no claim resolves, so nothing renders — the homepage
    // never asserts a positioning it cannot back.
    assert.deepEqual(homepageVerifiedClaims({}), []);
  });
});

// Verified homepage facts are rendered from the validated claim registry.
describe("T16/F1 — rendered homepage facts are reconciled with the validated set", () => {
  const pageSource = readFileSync(new URL("../src/pages/index.astro", import.meta.url), "utf-8");
  const renderedBody = pageSource
    .split(/^---\s*$/m)
    .slice(2)
    .join("---");

  test("verified facts render through homepageVerifiedClaims()", () => {
    const component = readFileSync(
      new URL("../src/components/VerifiedClaims.astro", import.meta.url),
      "utf-8",
    );
    assert.match(pageSource, /const claims = homepageVerifiedClaims\(\)/);
    assert.match(pageSource, /import VerifiedClaims/);
    assert.match(renderedBody, /<VerifiedClaims claims=\{claims\}/);
    assert.match(component, /claims\.map\(\(claim\) =>/);
    assert.match(component, /\{claim\.statement\}/);
  });

  test("each rendered fact is a validated SELF_PROJECT_CLAIMS statement", () => {
    const validated = new Set(SELF_PROJECT_CLAIMS.map((c) => c.statement));
    const rendered = homepageVerifiedClaims().map((c) => c.statement);
    assert.ok(rendered.length > 0, "the promoted homepage renders at least one verified fact");
    for (const statement of rendered) {
      assert.ok(
        validated.has(statement),
        `rendered fact "${statement}" must be a validated SELF_PROJECT_CLAIMS statement`,
      );
    }
  });

  // INV-09 scope: no metric numbers, no testimonial attributions, no third-party
  // client/outcome guarantees. These would require evidence the self-project claim
  // set does not (and cannot) back. Descriptive service copy is not in scope.
  test("the homepage asserts no metric, testimonial, or client-outcome claim", () => {
    const metric = /\b\d+\s*(?:%|percent|x|hours?|days?|minutes?|users?|customers?|clients?)\b/i;
    const testimonial = /\b(?:testimonial|client said|customer said|quote)\b/i;
    const guarantee = /\b(?:guarantee|promise\b|ensured|proven results)\b/i;
    const unsupportedOutcome =
      /(?:repetitive work stops coming back|stop carrying the workflow forever|exceptions recover or escalate)/i;
    for (const [label, pattern] of [
      ["metric", metric],
      ["testimonial", testimonial],
      ["outcome guarantee", guarantee],
      ["unsupported outcome", unsupportedOutcome],
    ]) {
      assert.ok(
        !pattern.test(renderedBody),
        `homepage must not assert a ${label} (INV-09 scope)`,
      );
    }
  });
});
