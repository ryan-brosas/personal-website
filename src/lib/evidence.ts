// T8 evidence policy kernel (Plan seo-geo-authority-refactor, design §12.5, INV-09).
// Claim -> source resolution against the public-safe source registry
// (T7 `src/data/sources.json`). A claim resolves ONLY when it is approved, has at
// least one source id, and every id is present in the registry. `assertClaimResolvable`
// is the build gate: it throws on any unresolvable claim so a public page cannot ship
// a metric/testimonial with a missing or non-approved evidence ref.
//
import type {
  ClaimKind,
  ClaimRecord,
  ClaimStatus,
  SourcePermission,
  SourceRecord,
  SourceRegistry,
  SourceType,
} from "../config/entities.ts";

export type {
  ClaimKind,
  ClaimRecord,
  ClaimStatus,
  SourcePermission,
  SourceRecord,
  SourceRegistry,
  SourceType,
};

// Errors as data: the pure resolvers return a discriminated union; only the
// build gate (`assertClaimResolvable`) throws.
export type EvidenceResolution =
  | { ok: true; sources: SourceRecord[] }
  | { ok: false; error: string };

// Resolve a claim to its backing sources. Fail-closed: a non-approved claim, a
// claim with no sources, or any source id absent from the registry is unresolvable.
// `Object.hasOwn` guards against inherited-property ids (e.g. "constructor").
export const resolveClaim = (claim: ClaimRecord, registry: SourceRegistry): EvidenceResolution => {
  if (claim.status !== "approved") return { ok: false, error: `claim-${claim.status}` };
  if (claim.sourceIds.length === 0) return { ok: false, error: "no-sources" };
  const sources: SourceRecord[] = [];
  for (const id of claim.sourceIds) {
    const source = registry[id];
    if (!Object.hasOwn(registry, id) || source === undefined)
      return { ok: false, error: "missing-source" };
    sources.push(source);
  }
  return { ok: true, sources };
};

// Public-page variant: an internal-only source can validate an internal draft but
// cannot back a public claim (design §12.5 — no public link/exposed path).
export const resolvePublicClaim = (
  claim: ClaimRecord,
  registry: SourceRegistry,
): EvidenceResolution => {
  const base = resolveClaim(claim, registry);
  if (!base.ok) return base;
  const leaked = base.sources.find((s) => s.permission === "internal-only");
  if (leaked) return { ok: false, error: "internal-only-source" };
  return base;
};

// Build gate: throws on an unresolvable claim, otherwise returns the sources.
export const assertClaimResolvable = (
  claim: ClaimRecord,
  registry: SourceRegistry,
): SourceRecord[] => {
  const r = resolveClaim(claim, registry);
  if (!r.ok) throw new Error(`evidence: ${r.error} (claim ${claim.id})`);
  return r.sources;
};
