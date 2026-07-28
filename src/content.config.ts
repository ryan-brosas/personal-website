// Astro content adapter for pages, case studies, resources, and site settings. Record
// validation remains in lib/content-schemas.ts.
import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import {
  PageSchema,
  SettingsDataSchema,
  CaseStudyRecordSchema,
  EditorialResourceRecordSchema,
  ToolRecordSchema,
  WikiRecordSchema,
  ProofPointRecordSchema,
} from "./lib/content-schemas.ts";

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/pages",
    // Always derive the ID from the filename, ignoring any frontmatter `slug`.
    // Astro's default generateId uses data.slug if present, which would break the
    // fixed ID mapping in src/config/site.ts (about/services/contact). This
    // ensures the entry ID always matches the filename without extension.
    generateId: ({ entry }) => entry.replace(/\.[^.]+$/, ""),
  }),
  schema: PageSchema,
});

// Public case studies carry the richer publishing and evidence contract.
const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: CaseStudyRecordSchema,
});

const resources = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "!tools/**/*.md", "!wiki/**/*.md"],
    base: "./src/content/resources",
  }),
  schema: EditorialResourceRecordSchema,
});

const tools = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/resources/tools" }),
  schema: ToolRecordSchema,
});

const wiki = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/resources/wiki" }),
  schema: WikiRecordSchema,
});

// Homepage evidence rail. Adding a figure means adding a file here; it only
// reaches the page once its sourceId resolves public-safe (lib/proof-points.ts).
const proof = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/proof" }),
  schema: ProofPointRecordSchema,
});

const settings = defineCollection({
  loader: file("./src/content/settings/site.json"),
  schema: SettingsDataSchema,
});

export const collections = {
  pages,
  "case-studies": caseStudies,
  resources,
  tools,
  wiki,
  proof,
  settings,
};
