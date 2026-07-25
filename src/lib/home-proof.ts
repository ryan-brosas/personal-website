// W4·T16 (SEO/GEO authority refactor) — the homepage promotion proof gate.
//
// The homepage ("/" / ROUTE_REGISTRY "home") ships noindex in the first release
// and is promoted to public ONLY when a machine-executable, ALL-true proof gate
// holds (design §home-proof gate, INV-07). This module splits that gate into:
//
//   1. `homepageProofGate` — a PURE, injectable function (case study record +
//      source registry + homepage claims in; a discriminated result out). It is
//      the testable core and reuses the T8 evidence kernel (`resolvePublicClaim`)
//      — it never re-implements or weakens claim/source resolution. Node-testable
//      in both directions without any filesystem or Astro runtime.
//
//   2. `resolveHomeVisibility` — the EDGE loader that reads the real inputs (the
//      tracked self-project case study frontmatter, the public-safe source
//      registry, and the seeded homepage claims) and runs the pure gate to derive
//      the "home" route's visibility. Fail-closed: any read/parse error keeps the
//      homepage noindex, never silently promoting it.
//
// The gate covers the record-level conditions (case study public + verified,
// resolvable evidence with a labelled source; every homepage claim carries a
// resolvable evidence ref). The build-level condition (`/` present in the
// verifier's expectedDiscoverableRoutes after `npm run build && npm run verify`)
// is enforced by the verifier + the shell suite, whose draft-flip QA scenario
// re-derives this visibility in a fresh build process.
import { resolvePublicClaim } from "./evidence.ts";
import type { ClaimRecord, SourceRegistry } from "./evidence.ts";
import type { Visibility } from "./publishing.ts";

// node:fs is typed via the minimal ambient shim in src/env.d.ts (no @types/node).
// `process` is declared type-only (no @types/node) — same pattern as
// route-registry.ts. Zero runtime cost; the Node test runner and Vite/Astro SSG
// both provide it.
declare const process: { cwd(): string };

// ── Pure gate ────────────────────────────────────────────────────────────────

// The minimal projection of the self-project case study the gate needs: its
// publication visibility and its single `evidence` object (T6 schema — one
// object, not an array). `undefined` models an absent case study file.
export interface HomeProofCaseStudy {
  readonly visibility: string;
  readonly evidence: { readonly kind: string; readonly sourceId: string };
}

export interface HomeProofInput {
  // The tracked self-project case study, or undefined when the file is absent.
  readonly caseStudy: HomeProofCaseStudy | undefined;
  // The public-safe source registry (T7 sources.json), keyed by source id.
  readonly sources: SourceRegistry;
  // The homepage's approved factual claims (T7 SELF_PROJECT_CLAIMS). Every one
  // must resolve to a public-safe source or the homepage stays noindex.
  readonly claims: readonly ClaimRecord[];
}

// Errors as data: the gate returns a discriminated result. `promoted` doubles as
// the discriminant and the go/no-go decision; `visibility` is the derived route
// disposition so the caller never re-maps the boolean to a literal.
export type HomeProofResult =
  | { readonly promoted: true; readonly visibility: "public"; readonly sourceId: string }
  | { readonly promoted: false; readonly visibility: "noindex"; readonly reason: string };

const deny = (reason: string): HomeProofResult => ({
  promoted: false,
  visibility: "noindex",
  reason,
});

/**
 * The machine-executable homepage promotion gate. Fail-closed: `/` stays
 * `noindex` unless EVERY condition holds —
 *   1. the self-project case study exists, is `public`, and carries `kind:'verified'`
 *      evidence whose `sourceId` resolves in the public-safe source registry;
 *   2. that resolved source has a non-empty label;
 *   3. every homepage claim resolves to a public-safe source (no unbacked claim).
 * Evidence resolution is delegated to the T8 kernel (`resolvePublicClaim`), which
 * also rejects an internal-only source backing a public claim — never re-derived here.
 */
export const homepageProofGate = (input: HomeProofInput): HomeProofResult => {
  const { caseStudy, sources, claims } = input;

  // (1) The self-project case study must exist and be public.
  if (caseStudy === undefined) return deny("case-study-absent");
  if (caseStudy.visibility !== "public") return deny("case-study-not-public");

  // (1) …with verified evidence resolving to a registered public-safe source.
  if (caseStudy.evidence.kind !== "verified") return deny("evidence-not-verified");
  const sourceId = caseStudy.evidence.sourceId;
  if (sourceId === "") return deny("evidence-missing-source-id");
  // Reuse the evidence kernel: model the case study's evidence as an approved
  // claim so the SAME resolver (present + not internal-only) gates it.
  const evidenceResolved = resolvePublicClaim(
    {
      id: "home-proof-case-study-evidence",
      statement: "The self-project case study cites a public-safe source.",
      kind: "fact",
      sourceIds: [sourceId],
      status: "approved",
    },
    sources,
  );
  if (!evidenceResolved.ok) return deny(`case-study-evidence-${evidenceResolved.error}`);

  // (2) The resolved source must carry a non-empty label.
  const source = sources[sourceId];
  if (source === undefined || source.title.trim() === "") return deny("source-missing-label");

  // (3) Every homepage claim must resolve to a public-safe source (no unbacked
  // positioning). An empty claim set is itself a failure — a promoted homepage
  // must stand on at least one evidence-backed claim.
  if (claims.length === 0) return deny("no-homepage-claims");
  for (const claim of claims) {
    const claimResolved = resolvePublicClaim(claim, sources);
    if (!claimResolved.ok) return deny(`homepage-claim-${claimResolved.error}`);
  }

  return { promoted: true, visibility: "public", sourceId };
};

// ── Edge loader ──────────────────────────────────────────────────────────────

// The tracked self-project case study + the seeded evidence inputs. These are
// value imports (not types), so the real files drive the promotion decision —
// flipping the case study to draft (or removing its source) keeps `/` noindex.
import { readFileSync } from "node:fs";
import { SELF_PROJECT_CLAIMS } from "../config/entities.ts";
import sourcesJson from "../data/sources.json" with { type: "json" };

// sources.json is the T7 boundary-validated public-safe registry (parsed/verified
// by parseSourceRegistry in the content pipeline); here it is consumed read-only
// for its `title`/`permission` fields, so a single boundary cast is sufficient.
const SOURCES = sourcesJson as unknown as SourceRegistry;

// Resolved from the invocation cwd (the Astro project root — the invariant for
// both `astro build` and the Node test runner), NOT import.meta.url: Vite bundles
// config/routes.ts → this module, so import.meta.url points at a build chunk, not
// src/lib/, and a relative content path would not resolve at build time.
const CASE_STUDY_PATH = `${process.cwd()}/src/content/case-studies/this-site.md`;

// Extract a scalar `key: value` (quotes optional) from a frontmatter block.
const scalar = (block: string, key: string): string | undefined => {
  const match = block.match(new RegExp(`^[ \\t]*${key}:[ \\t]*["']?([^"'\\n]+)["']?[ \\t]*$`, "m"));
  return match ? match[1].trim() : undefined;
};

// Read the tracked self-project case study into the gate's projection, or
// undefined when the file/frontmatter/evidence cannot be read. Pure parsing over
// the file text — no schema coupling beyond the two fields the gate consumes.
const loadSelfProjectCaseStudy = (): HomeProofCaseStudy | undefined => {
  let raw: string;
  try {
    raw = readFileSync(CASE_STUDY_PATH, "utf-8");
  } catch {
    return undefined;
  }
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return undefined;
  const frontmatter = fm[1];
  const visibility = scalar(frontmatter, "visibility");
  if (visibility === undefined) return undefined;
  // Scope the evidence lookup to the nested `evidence:` block so the top-level
  // `kind: case-study` is never mistaken for the evidence kind.
  const evidenceBlock = frontmatter.match(/^evidence:[ \t]*\n((?:[ \t]+.*(?:\n|$))*)/m);
  const block = evidenceBlock ? evidenceBlock[1] : "";
  return {
    visibility,
    evidence: {
      kind: scalar(block, "kind") ?? "",
      sourceId: scalar(block, "sourceId") ?? "",
    },
  };
};

/**
 * Derive the "home" route's visibility from the proof gate over the real repo
 * inputs. Fail-closed: any failure keeps the homepage `noindex`. Called once at
 * registry construction (config/routes.ts) so the homepage promotion flows
 * through the single route pipeline (sitemap, robots meta, verifier) in lockstep.
 */
export const resolveHomeVisibility = (): Visibility =>
  homepageProofGate({
    caseStudy: loadSelfProjectCaseStudy(),
    sources: SOURCES,
    claims: SELF_PROJECT_CLAIMS.map((claim) => ({
      id: claim.id,
      statement: claim.statement,
      kind: claim.kind,
      sourceIds: [...claim.sourceIds],
      status: claim.status,
    })),
  }).visibility;

/**
 * T16 — the positioning claims the homepage may RENDER. It is exactly the subset
 * of `SELF_PROJECT_CLAIMS` whose backing source resolves public-safe through the
 * SAME authority the proof gate uses (`resolvePublicClaim`). index.astro renders
 * this list verbatim, so the rendered positioning can never drift from the
 * validated claim set (no unbacked copy) and never surfaces an internal-only /
 * unresolvable claim. When the gate has promoted "/" to public, every seeded
 * claim resolves, so the full set renders; otherwise the homepage is noindex.
 */
export const homepageClaims = (registry: SourceRegistry = SOURCES): ClaimRecord[] =>
  SELF_PROJECT_CLAIMS.map((claim) => ({
    id: claim.id,
    statement: claim.statement,
    kind: claim.kind,
    sourceIds: [...claim.sourceIds],
    status: claim.status,
  })).filter((claim) => resolvePublicClaim(claim, registry).ok);
