/**
 * Content-layer schemas compose publishing primitives into records shared by
 * `src/content.config.ts` and Node tests. They use `astro/zod` so tests can
 * import the schemas without the runtime-only `astro:content` module.
 */
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

// Settings singleton — inner shape only. The file envelope is
// {"site": <SettingsData>}; the file() loader uses the top-level key as the
// entry ID ("site") and validates the inner value against this schema.
//
// siteTitle and navLabels are required. The contact block owns the scheduler URL,
// email fallback, and privacy mode. Its schema requires HTTPS and the exact
// calendly.com hostname on schedulerUrl (parsed URL, no suffix matching).
// privacyRequired stays false because the site has no privacy route.
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

// Authority records combine shared publication primitives with service and
// case-study contracts. Visibility and evidence remain owned by publishing.ts.

// Authority records carry `modifiedAt` and `expiresAt` for freshness review.
// `DateFieldsSchema` remains the smaller collection timestamp contract.
export const PublicationDatesSchema = z.object({
  publishedAt: z.string().datetime().optional(),
  modifiedAt: z.string().datetime().optional(),
  reviewedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});
export type PublicationDates = z.infer<typeof PublicationDatesSchema>;

export const ReviewStatusSchema = z.enum(["unreviewed", "reviewed", "stale"]);

// The shared publication model keeps the fail-closed draft default
// from the kernel; `owner` is locked to the single-author literal; `evidence`
// remains the kernel's verified|proposed|open discriminated union.
export const PublicationRecordSchema = z.object({
  visibility: VisibilitySchema.default("draft"),
  dates: PublicationDatesSchema.optional(),
  owner: z.literal("ryan"),
  reviewStatus: ReviewStatusSchema.optional(),
  evidence: EvidenceSchema.optional(),
});

export const RobotsSchema = z.object({
  index: z.boolean(),
  follow: z.boolean(),
  maxImagePreview: z.enum(["none", "standard", "large"]).optional(),
  maxSnippet: z.number().int().optional(),
  maxVideoPreview: z.number().int().optional(),
});

// Editors cannot mint arbitrary canonical overrides:
// an override is rejected by default and only passes when its exact value is in
// this code-owned list. Empty today (no migration/import cases yet).
// TODO: Populate this list only for approved migrations, no earlier than 2026-12-01.
export const CANONICAL_OVERRIDE_ALLOWLIST: readonly string[] = [];

// SEO fields require the visible title and description used by metadata.
// TODO: Add socialImage after the asset model ships, no earlier than 2026-12-01.
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

// The topic pillar is a closed set; taxonomy pages are never
// auto-generated from it (planning + internal-linking only).
export const TopicPillarSchema = z.enum([
  "ai-workflow-systems",
  "agent-reliability",
  "content-research-operations",
  "context-knowledge-systems",
]);

export const SearchIntentSchema = z.enum([
  "commercial",
  "problem-aware",
  "solution-aware",
  "implementation",
  "comparison",
  "research",
]);

export const AudienceSchema = z.enum(["founder", "operator", "content-team", "technical-reader"]);

export const TopicFieldsSchema = z.object({
  pillar: TopicPillarSchema,
  intents: z.array(SearchIntentSchema).optional(),
  audience: z.array(AudienceSchema).optional(),
  internalPrimaryQuestion: z.string().min(1).optional(),
});

// Service records add a discriminant and slug without asserting authoring fields
// that current content does not use.
// TODO: Add deliverables, outcomes, process, and primaryCta when service detail
// pages ship, no earlier than 2026-12-01.
export const ServiceRecordSchema = PublicationRecordSchema.merge(SeoFieldsSchema).extend({
  kind: z.literal("service"),
  slug: z.string().min(1),
});

// Case-study records add a discriminant and slug to publication, SEO, and topic
// fields.
// TODO: Add challenge, decisions, verification, and claimIds when structured
// narratives ship, no earlier than 2026-12-01.
// A public case study must cite verified evidence (INV-09):
// a public page never ships an evidence-free authority claim. `evidence` is one
// discriminated-union object, so the gate requires it to be present with
// `kind: "verified"` when visibility is public.
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

export const ResourceFormatSchema = z.enum([
  "article",
  "guide",
  "checklist",
  "template",
  "reference",
  "tool",
]);

export const ResourceAttachmentSchema = z.object({
  label: z.string().min(1),
  path: z
    .string()
    .regex(
      /^\/downloads\/[A-Za-z0-9][A-Za-z0-9._~/-]*$/,
      "attachment path must be a safe site-local /downloads/ path",
    )
    .refine(
      (value) => value.split("/").every((segment) => segment !== "." && segment !== ".."),
      "attachment path must not contain traversal segments",
    ),
  mediaType: z
    .string()
    .regex(/^[A-Za-z0-9][A-Za-z0-9.+-]*\/[A-Za-z0-9][A-Za-z0-9.+-]*$/),
  description: z.string().min(1).optional(),
  license: z.string().min(1).optional(),
});

export const ResourceRecordSchema = PublicationRecordSchema.merge(SeoFieldsSchema)
  .merge(TopicFieldsSchema)
  .extend({
    kind: z.literal("resource"),
    format: ResourceFormatSchema,
    slug: z.string().min(1),
    attachments: z.array(ResourceAttachmentSchema).min(1).optional(),
  })
  .superRefine((resource, ctx) => {
    const paths = new Set<string>();
    resource.attachments?.forEach((attachment, index) => {
      if (paths.has(attachment.path)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["attachments", index, "path"],
          message: "attachment paths must be unique within a resource",
        });
      }
      paths.add(attachment.path);
    });
  });

export const EditorialResourceRecordSchema = ResourceRecordSchema.refine(
  (resource) => resource.format !== "tool",
  { message: "editorial resources cannot use the tool format", path: ["format"] },
);

export const ToolRecordSchema = ResourceRecordSchema.refine(
  (resource) => resource.format === "tool",
  { message: "tools must use the tool format", path: ["format"] },
);

// The plain-language concept index uses the site-wide `pillar` as its sole
// grouping key, avoiding a parallel wiki-only taxonomy. Each entry is an original
// grade-6 summary; the shared external source directory is a
// code-owned constant on the entry page, not a per-record field.
export const WikiRecordSchema = PublicationRecordSchema.merge(SeoFieldsSchema)
  .merge(TopicFieldsSchema)
  .extend({
    kind: z.literal("wiki"),
    slug: z.string().min(1),
  });

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
