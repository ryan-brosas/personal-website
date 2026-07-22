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
    about: z.string().min(1),
    services: z.string().min(1),
    contact: z.string().min(1),
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
