// M2 (Plan 03, Child 1) content adapter. Thin wiring over the shared content
// schemas in ./lib/content-schemas.ts (which compose the policy kernel in
// ./lib/publishing.ts). Registers the launch collections (empty until content
// arrives; glob() warns but does not throw) and the settings singleton.
// Runtime-only astro:content / astro:loaders imports are gated by
// `astro check` + `astro build`, not Node behavioral tests.
import { defineCollection, reference } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";
import { RecordBase, PageSchema, SettingsDataSchema } from "./lib/content-schemas.ts";

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
  schema: SettingsDataSchema,
});

export const collections = {
  pages,
  projects,
  blog,
  directories,
  directoryEntries,
  settings,
};
