// M2 (Plan 03, Child 1) content-layer schemas. Pure importable module composing
// the policy kernel primitives (publishing.ts) into record schemas consumed by
// both src/content.config.ts (adapter) and Node tests via safeParse.
// Imports astro/zod (Node-resolvable), NOT astro:content (runtime-only).
import { z } from "astro/zod";
import { VisibilitySchema, EvidenceSchema, DateFieldsSchema } from "./publishing.ts";

// Shared record base — visibility (fail-closed default draft), optional evidence
// and distinct date fields. Consumed by every launch collection that stores a
// publication record (pages, projects, blog, directories, directoryEntries).
export const RecordBase = z.object({
  visibility: VisibilitySchema.default("draft"),
  evidence: EvidenceSchema.optional(),
  dates: DateFieldsSchema.optional(),
});

// Page record schema (frontmatter-only). The Markdown body is validated
// separately by the core-pages child's body-safety guard; PageSchema owns only
// the entry data. Title and description are required for any page that ships.
export const PageSchema = RecordBase.extend({
  title: z.string().min(1),
  description: z.string().min(1),
});
export type PageRecord = z.infer<typeof PageSchema>;

// Settings singleton — inner shape only. The file envelope is
// {"site": <SettingsData>}; the file() loader uses the top-level key as the
// entry ID ("site") and validates the inner value against this schema.
//
// siteTitle and navLabels are required. The contact block is REQUIRED: it owns
// the scheduler URL + email fallback + privacy mode. The Contact child enforces
// HTTPS + the exact calendly.com hostname on schedulerUrl (parsed URL, no suffix
// matching) and locks privacyRequired to literal false (M2 has no privacy route).
export const SettingsDataSchema = z.object({
  siteTitle: z.string().min(1),
  navLabels: z.object({
    home: z.string().min(1),
    about: z.string().min(1),
    services: z.string().min(1),
    contact: z.string().min(1),
    caseStudies: z.string().min(1),
    resources: z.string().min(1),
  }),
  contact: z.object({
    schedulerUrl: z
      .string()
      .url()
      .refine((value) => {
        try {
          const url = new URL(value);
          return url.protocol === "https:" && url.hostname === "calendly.com";
        } catch {
          return false;
        }
      }, "schedulerUrl must use HTTPS on calendly.com"),
    emailFallback: z.string().email(),
    privacyRequired: z.literal(false),
  }),
});
export type SettingsData = z.infer<typeof SettingsDataSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SEO/GEO authority models (Plan seo-geo-authority-refactor, T6, design §12).
// Shared publication primitives + purpose-specific service / case-study records.
// visibility + evidence unions are OWNED by publishing.ts and imported here — never
// redefined. Node-importable (astro/zod only); consumed by content.config.ts and
// tests via safeParse.
// ─────────────────────────────────────────────────────────────────────────────

// §12.2 publication dates. Distinct from publishing.ts DateFieldsSchema: this set
// carries `modifiedAt` and `expiresAt` (freshness gate) per the authority model,
// where the M1 kernel used `updatedAt` and no expiry. Kept local to avoid mutating
// the publishing kernel.
export const PublicationDatesSchema = z.object({
  publishedAt: z.string().datetime().optional(),
  modifiedAt: z.string().datetime().optional(),
  reviewedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});
export type PublicationDates = z.infer<typeof PublicationDatesSchema>;

// §12.2 review workflow state.
export const ReviewStatusSchema = z.enum(["unreviewed", "reviewed", "stale"]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

// §12.2 shared publication model. `visibility` keeps the fail-closed draft default
// from the kernel; `owner` is locked to the single-author literal; `evidence`
// remains the kernel's verified|proposed|open discriminated union.
export const PublicationRecordSchema = z.object({
  visibility: VisibilitySchema.default("draft"),
  dates: PublicationDatesSchema.optional(),
  owner: z.literal("ryan"),
  reviewStatus: ReviewStatusSchema.optional(),
  evidence: EvidenceSchema.optional(),
});
export type PublicationRecord = z.infer<typeof PublicationRecordSchema>;

// §12.3 robots directive block (per-record crawl hints).
export const RobotsSchema = z.object({
  index: z.boolean(),
  follow: z.boolean(),
  maxImagePreview: z.enum(["none", "standard", "large"]).optional(),
  maxSnippet: z.number().int().optional(),
  maxVideoPreview: z.number().int().optional(),
});
export type Robots = z.infer<typeof RobotsSchema>;

// §12.3 canonicalOverride allowlist. Editors cannot mint arbitrary canonicals:
// an override is rejected by default and only passes when its exact value is in
// this code-owned list. Empty today (no migration/import cases yet).
// TODO(handle): populate with approved migration canonicals when imports land. on-or-after 2026-12-01
export const CANONICAL_OVERRIDE_ALLOWLIST: readonly string[] = [];

// §12.3 SEO fields. title/description are required (visible page title + meta).
// socialImage (AssetRef, §12.11) is deferred — not modelled until the asset model
// ships. TODO(handle): add socialImage: AssetRefSchema once §12.11 lands. on-or-after 2026-12-01
export const SeoFieldsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  socialTitle: z.string().min(1).optional(),
  socialDescription: z.string().min(1).optional(),
  socialImageAlt: z.string().min(1).optional(),
  robots: RobotsSchema.optional(),
  canonicalOverride: z
    .string()
    .refine(
      (value) => CANONICAL_OVERRIDE_ALLOWLIST.includes(value),
      "canonicalOverride must be an allowlisted, code-owned path",
    )
    .optional(),
});
export type SeoFields = z.infer<typeof SeoFieldsSchema>;

// §12.6 topic + intent model. The pillar is a closed set; taxonomy pages are never
// auto-generated from it (planning + internal-linking only).
export const TopicPillarSchema = z.enum([
  "ai-workflow-systems",
  "agent-reliability",
  "content-research-operations",
  "context-knowledge-systems",
]);
export type TopicPillar = z.infer<typeof TopicPillarSchema>;

export const SearchIntentSchema = z.enum([
  "commercial",
  "problem-aware",
  "solution-aware",
  "implementation",
  "comparison",
  "research",
]);
export type SearchIntent = z.infer<typeof SearchIntentSchema>;

export const AudienceSchema = z.enum(["founder", "operator", "content-team", "technical-reader"]);
export type Audience = z.infer<typeof AudienceSchema>;

export const TopicFieldsSchema = z.object({
  pillar: TopicPillarSchema,
  intents: z.array(SearchIntentSchema).optional(),
  audience: z.array(AudienceSchema).optional(),
  internalPrimaryQuestion: z.string().min(1).optional(),
});
export type TopicFields = z.infer<typeof TopicFieldsSchema>;

// §12.7 service record = publication + SEO, plus a service discriminant and slug.
// Rich authoring fields (deliverables, process, proofRefs, …) are deferred to the
// service-page child; the type stays honest by not asserting fields no content uses.
// TODO(handle): add deliverables/outcomes/process/primaryCta from §12.7 when the
// services page ships. on-or-after 2026-12-01
export const ServiceRecordSchema = PublicationRecordSchema.merge(SeoFieldsSchema).extend({
  kind: z.literal("service"),
  slug: z.string().min(1),
});
export type ServiceRecord = z.infer<typeof ServiceRecordSchema>;

// §12.8 case-study record = publication + SEO + topic, plus a case-study discriminant
// and slug. Narrative fields (challenge, decisions, verification, …) are deferred to
// the case-study child. TODO(handle): add challenge/decisions/verification/claimIds
// from §12.8 when the case-study page ships. on-or-after 2026-12-01
// A PUBLIC case study must cite verified evidence (T6, design §12.8 + INV-09):
// a public page never ships an evidence-free authority claim. `evidence` is a
// SINGLE object (publishing.ts EvidenceSchema discriminated union), so the gate
// requires it to be present AND `kind:"verified"` when visibility is public.
// draft/noindex records are exempt (no route / excluded from discovery), keeping
// the fail-closed draft default frictionless for work-in-progress.
export const CaseStudyRecordSchema = PublicationRecordSchema.merge(SeoFieldsSchema)
  .merge(TopicFieldsSchema)
  .extend({
    kind: z.literal("case-study"),
    slug: z.string().min(1),
  })
  .superRefine((record, ctx) => {
    if (record.visibility !== "public") return;
    if (record.evidence === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evidence"],
        message: "a public case study must cite verified evidence",
      });
      return;
    }
    if (record.evidence.kind !== "verified") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evidence"],
        message: "a public case study's evidence must be kind:'verified'",
      });
    }
  });
export type CaseStudyRecord = z.infer<typeof CaseStudyRecordSchema>;

export const ResourceFormatSchema = z.enum(["guide", "checklist", "template", "reference"]);
export type ResourceFormat = z.infer<typeof ResourceFormatSchema>;

export const ResourceRecordSchema = PublicationRecordSchema.merge(SeoFieldsSchema)
  .merge(TopicFieldsSchema)
  .extend({
    kind: z.literal("resource"),
    format: ResourceFormatSchema,
    slug: z.string().min(1),
  });
export type ResourceRecord = z.infer<typeof ResourceRecordSchema>;

// A homepage evidence-rail figure. sourceId is required, so a proof point with
// no backing source cannot be authored at all; lib/proof-points.ts additionally
// withholds any entry whose source is unregistered or internal-only.
export const ProofPointRecordSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().min(1),
  sourceId: z.string().min(1),
  status: z.enum(["approved", "blocked", "retired"]),
  order: z.number().int().nonnegative(),
});
export type ProofPointRecord = z.infer<typeof ProofPointRecordSchema>;
