/**
 * Promotes the homepage only when the self-project case study is public with
 * verified, resolvable evidence and every registered homepage claim resolves.
 * homepageProofGate is the injectable policy; resolveHomeVisibility loads the
 * tracked case study and converts its read or frontmatter failure to noindex. A
 * malformed source registry fails the build at its validation boundary.
 */
import { resolvePublicClaim } from "./evidence.ts";
import type { ClaimRecord, SourceRegistry } from "./evidence.ts";
import type { Visibility } from "./publishing.ts";

declare const process: { cwd(): string };

// The gate needs publication visibility and one evidence object. `undefined`
// models an absent case-study file.
export interface HomeProofCaseStudy {
  readonly visibility: string;
  readonly evidence: { readonly kind: string; readonly sourceId: string };
}

export interface HomeProofInput {
  // The tracked self-project case study, or undefined when the file is absent.
  readonly caseStudy: HomeProofCaseStudy | undefined;
  // The public-safe source registry, keyed by source id.
  readonly sources: SourceRegistry;
  // Every registered homepage claim must resolve to a public-safe source.
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
 *   3. every registered homepage proof claim resolves to a public-safe source (no unbacked claim).
 * Evidence resolution is delegated to `resolvePublicClaim`, which
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

  // A promoted homepage must carry at least one registered, public-safe proof claim.
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
import { fileURLToPath } from "node:url";
import { SELF_PROJECT_CLAIMS, parseSourceRegistryOrThrow } from "../config/entities.ts";
import sourcesJson from "../data/sources.json" with { type: "json" };

const SOURCES = parseSourceRegistryOrThrow(sourcesJson);

const CASE_STUDY_PATH = import.meta.url.includes("/src/lib/home-proof.")
  ? fileURLToPath(new URL("../content/case-studies/this-site.md", import.meta.url))
  : `${process.cwd()}/src/content/case-studies/this-site.md`;

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
 * Returns the registered homepage claims whose backing sources resolve through
 * the same public-safe policy used by the promotion gate. Rendering this result
 * prevents unbacked or internal-only claims from drifting into homepage copy.
 */
export const homepageVerifiedClaims = (registry: SourceRegistry = SOURCES): ClaimRecord[] =>
  SELF_PROJECT_CLAIMS.map((claim) => ({
    id: claim.id,
    statement: claim.statement,
    kind: claim.kind,
    sourceIds: [...claim.sourceIds],
    status: claim.status,
  })).filter((claim) => resolvePublicClaim(claim, registry).ok);
