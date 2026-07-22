// M1 (Plan 01) publishing policy kernel. Pure Zod schemas + pure functions
// consumed by both src/content.config.ts (adapter) and Node tests via safeParse.
// Imports `astro/zod` (a real, Node-resolvable subpath re-export of zod 3.x),
// NOT the runtime-only `astro:content` virtual module.
import { z } from "astro/zod";

// Visibility (per-record publication state, fail-closed default draft).
// draft -> no route output; noindex -> crawlable but excluded from discovery;
// public -> routes + discovery.
export const DEFAULT_VISIBILITY = "draft";

export const VisibilitySchema = z.enum(["draft", "public", "noindex"]);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const isDiscoverable = (v: string): boolean => v === "public";
export const isRoutable = (v: string): boolean => v === "public" || v === "noindex";

// Evidence variants (claim-level). Verified requires a sourceId present in the
// public-safe source registry; Proposed requires a trade-off; Open requires
// missing proof + a blocked decision.
export const VerifiedEvidence = z.object({
  kind: z.literal("verified"),
  sourceId: z.string().min(1),
});

export const ProposedEvidence = z.object({
  kind: z.literal("proposed"),
  tradeOff: z.string().min(1),
});

export const OpenEvidence = z.object({
  kind: z.literal("open"),
  missingProof: z.string().min(1),
  blocked: z.literal(true),
});

export const EvidenceSchema = z.discriminatedUnion("kind", [
  VerifiedEvidence,
  ProposedEvidence,
  OpenEvidence,
]);
export type Evidence = z.infer<typeof EvidenceSchema>;

export type SourceRegistry = Record<string, unknown>;
export type ValidateResult = { ok: boolean; error?: string };

export const validateEvidence = (e: unknown, registry: SourceRegistry): ValidateResult => {
  const parsed = EvidenceSchema.safeParse(e);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const data = parsed.data;
  if (data.kind === "verified") {
    if (!Object.hasOwn(registry, data.sourceId)) return { ok: false, error: "unknown-source" };
    return { ok: true };
  }
  if (data.kind === "proposed") {
    return { ok: true };
  }
  // Open: blocked is enforced as z.literal(true) at the schema boundary.
  return { ok: true };
};

// Distinct publication timestamps.
export const DateFieldsSchema = z.object({
  publishedAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  reviewedAt: z.string().datetime().optional(),
});
export type DateFields = z.infer<typeof DateFieldsSchema>;

// Relationship-target resolution against an injected synthetic collection map.
// Rejects hidden (missing collection/target), draft, and noindex targets; only
// public (discoverable) targets resolve.
export type RelationshipTarget = { collection: string; id: string };
export type CollectionEntry = { id: string; visibility: string };
export type CollectionsMap = Record<string, CollectionEntry[]>;
export type ResolveResult = { ok: boolean; target?: RelationshipTarget; error?: string };

export const resolveRelationship = (
  ref: RelationshipTarget,
  collections: CollectionsMap,
): ResolveResult => {
  const entries = collections[ref.collection];
  if (!entries) return { ok: false, error: "missing-collection" };
  const target = entries.find((e) => e.id === ref.id);
  if (!target) return { ok: false, error: "missing-target" };
  if (!isDiscoverable(target.visibility)) return { ok: false, error: "not-discoverable" };
  return { ok: true, target: ref };
};
