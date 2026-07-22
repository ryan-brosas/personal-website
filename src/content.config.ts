// M1 (Plan 01) content adapter. Thin wiring over the shared policy kernel in
// ./lib/publishing.ts — imports schemas, does NOT restate them. Registers the
// launch collections (empty in M1; glob() warns but does not throw) and the
// settings singleton (empty {} container; Plan 03 owns the first record).
// Runtime-only astro:content / astro:loaders imports are gated by
// `astro check` + `astro build`, not Node behavioral tests.
import { defineCollection, reference } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";
import { VisibilitySchema, EvidenceSchema, DateFieldsSchema } from "./lib/publishing.ts";

// Shared record base — imported from the policy kernel, not restated here.
const RecordBase = z.object({
  visibility: VisibilitySchema.default("draft"),
  evidence: EvidenceSchema.optional(),
  dates: DateFieldsSchema.optional(),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,json}", base: "./src/content/pages" }),
  schema: RecordBase,
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: RecordBase.extend({
    related: z.array(reference("projects")).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: RecordBase,
});

const directories = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,json}", base: "./src/content/directories" }),
  schema: RecordBase,
});

const directoryEntries = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/directoryEntries" }),
  schema: RecordBase.extend({
    directory: reference("directories").optional(),
  }),
});

const settings = defineCollection({
  loader: file("./src/content/settings/site.json"),
  schema: z.object({}),
});

export const collections = {
  pages,
  projects,
  blog,
  directories,
  directoryEntries,
  settings,
};
