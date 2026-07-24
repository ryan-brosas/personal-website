// M2 (Plan 03, Child 1) content adapter. Thin wiring over the shared content
// schemas in ./lib/content-schemas.ts (which compose the policy kernel in
// ./lib/publishing.ts). Registers the launch collections (empty until content
// arrives; glob() warns but does not throw) and the settings singleton.
// Runtime-only astro:content / astro:loaders imports are gated by
// `astro check` + `astro build`, not Node behavioral tests.
import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import {
  PageSchema,
  SettingsDataSchema,
  ServiceRecordSchema,
  CaseStudyRecordSchema,
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

// SEO/GEO authority launch collections (Plan seo-geo-authority-refactor, T6).
// Empty until content arrives; the .gitkeep-tracked dirs suppress glob's
// missing-base warnings. These replace the earlier M2 scaffold collections in
// the same commit — no orphan window.
const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: ServiceRecordSchema,
});

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: CaseStudyRecordSchema,
});

const settings = defineCollection({
  loader: file("./src/content/settings/site.json"),
  schema: SettingsDataSchema,
});

export const collections = {
  pages,
  services,
  "case-studies": caseStudies,
  settings,
};
