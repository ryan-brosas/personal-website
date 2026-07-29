// Author identity and source/claim authority registry. This Node-importable module
// uses string-literal domain types because `erasableSyntaxOnly` forbids enums and
// namespaces. A Zod boundary validates the public-safe source registry.
//
// `sources.json` is untrusted input. Only owner-verified, public-safe records may
// be seeded, and `sameAs` stays empty until profiles are confirmed.
import { z } from "astro/zod";
import type { ValidateResult } from "../lib/publishing.ts";
import { TopicPillarSchema } from "../lib/content-schemas.ts";

// §12.4 owner-verified external profile. `sameAs` is never inferred from a name match;
// each URL must be owner-verified and public. No profiles are confirmed yet, so the
// seed list is empty.
export type VerifiedExternalProfile = {
  readonly platform: "github" | "linkedin" | "x" | "other";
  readonly url: string;
  readonly verifiedAt: string;
  readonly public: true;
};

// The single author entity uses fixed identity literals. `knowsAbout` comes from
// the closed topic-pillar set so the entity graph and content model cannot drift.
export type PersonEntity = {
  readonly id: "ryan-brosas";
  readonly name: "Ryan Brosas";
  readonly fullName: string;
  readonly alternateNames: readonly string[];
  readonly role: string;
  readonly summary: string;
  readonly location: {
    readonly countryCode: "PH";
    readonly region?: string;
    readonly remote: true;
  };
  readonly sameAs: readonly VerifiedExternalProfile[];
  readonly knowsAbout: readonly string[];
};

// §12.5 source kinds/permissions (string-literal unions, not enums).
export type SourceType =
  | "public-url"
  | "approved-artifact"
  | "measurement-export"
  | "testimonial-approval"
  | "operator-observation";

export type SourcePermission = "public" | "redacted" | "internal-only";

export type SourceRecord = {
  readonly id: string;
  readonly title: string;
  readonly type: SourceType;
  readonly publicUrl?: string;
  readonly publicSafePath?: string;
  readonly owner: string;
  readonly permission: SourcePermission;
  readonly capturedAt?: string;
  readonly reviewedAt: string;
  readonly notes?: string;
};

export type SourceRegistry = Record<string, SourceRecord>;

// §12.5 claim kinds/status.
export type ClaimKind = "fact" | "metric" | "testimonial" | "interpretation" | "proposal";
export type ClaimStatus = "approved" | "blocked" | "retired";

export type ClaimRecord = {
  readonly id: string;
  readonly statement: string;
  readonly kind: ClaimKind;
  readonly sourceIds: readonly string[];
  readonly disclosure?: string;
  readonly validFrom?: string;
  readonly validThrough?: string;
  readonly status: ClaimStatus;
};

// ── Boundary schema ─────────────────────────────────────────────────────────
// zod schema for a single source record — validates the untrusted `sources.json`
// registry at the edge before it is trusted as `SourceRegistry`. Kept in sync with
// `SourceRecord` above.
export const SourceRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum([
    "public-url",
    "approved-artifact",
    "measurement-export",
    "testimonial-approval",
    "operator-observation",
  ]),
  publicUrl: z.string().url().optional(),
  publicSafePath: z.string().min(1).optional(),
  owner: z.string().min(1),
  permission: z.enum(["public", "redacted", "internal-only"]),
  capturedAt: z.string().datetime().optional(),
  reviewedAt: z.string().datetime(),
  notes: z.string().min(1).optional(),
});

export const SourceRegistrySchema = z.record(SourceRecordSchema);

type SourceRegistryParseResult =
  | { readonly ok: true; readonly data: SourceRegistry }
  | { readonly ok: false; readonly error: string };

const parseSourceRegistryData = (input: unknown): SourceRegistryParseResult => {
  const parsed = SourceRegistrySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  for (const [key, record] of Object.entries(parsed.data)) {
    if (record.id !== key) return { ok: false, error: "id-key-mismatch" };
    if (
      record.permission === "public" &&
      record.publicUrl === undefined &&
      record.publicSafePath === undefined
    ) {
      return { ok: false, error: "public-source-requires-location" };
    }
  }
  return { ok: true, data: parsed.data };
};

export const parseSourceRegistry = (input: unknown): ValidateResult => {
  const parsed = parseSourceRegistryData(input);
  return parsed.ok ? { ok: true } : parsed;
};

/** Returns validated source records or fails the build boundary. */
export const parseSourceRegistryOrThrow = (input: unknown): SourceRegistry => {
  const parsed = parseSourceRegistryData(input);
  if (!parsed.ok) throw new Error(`source registry validation failed: ${parsed.error}`);
  return parsed.data;
};

// Approved claims must cite at least one registered source. Blocked and retired
// claims do not render publicly, so source presence does not gate them.
export const resolveClaimSources = (
  claim: ClaimRecord,
  registry: SourceRegistry,
): ValidateResult => {
  if (claim.status !== "approved") return { ok: true };
  if (claim.sourceIds.length === 0) return { ok: false, error: "approved-claim-requires-source" };
  const missing = claim.sourceIds.filter((id) => !Object.hasOwn(registry, id));
  if (missing.length > 0) return { ok: false, error: "unknown-source" };
  return { ok: true };
};

// Topic pillars come from TopicPillarSchema so the person entity and content
// model share one authority.
const TOPIC_PILLARS: readonly string[] = TopicPillarSchema.options;

// The single author entity. `sameAs` is intentionally empty: no external profile is
// owner-verified yet. Do not add URLs here without a confirmed,
// public, owner-verified profile.
export const PERSON_ENTITY: PersonEntity = {
  id: "ryan-brosas",
  name: "Ryan Brosas",
  fullName: "Ryan Brosas",
  alternateNames: [],
  role: "AI workflow systems designer",
  summary:
    "Works on AI workflow systems with explicit context, checks, human handoffs, and recovery paths for founder-led teams.",
  location: { countryCode: "PH", remote: true },
  sameAs: [],
  knowsAbout: TOPIC_PILLARS,
};

// The only approved claim at launch: the transparent self-project. It is backed solely
// by self-referential, directly observable evidence (the live static build + public
// source repository). No metrics, testimonials, or client claims are asserted.
export const SELF_PROJECT_CLAIMS: readonly ClaimRecord[] = [
  {
    id: "claim-self-project-static-build-001",
    statement:
      "This website is built as static output and served from a publicly inspectable source repository.",
    kind: "fact",
    sourceIds: ["source-self-project-build-001"],
    status: "approved",
  },
];
