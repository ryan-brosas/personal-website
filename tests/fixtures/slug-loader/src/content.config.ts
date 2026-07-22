// Test-only content adapter mirroring the production pages loader
// (src/content.config.ts:12-23). Imports the REAL production PageSchema
// so the schema path is also exercised. The generateId replicates the
// production filename-derived ID that ignores frontmatter `slug`.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { PageSchema } from "../../../../src/lib/content-schemas.ts";

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/pages",
    // Mirrors production: derive ID from filename, ignoring frontmatter slug.
    generateId: ({ entry }) => entry.replace(/\.[^.]+$/, ""),
  }),
  schema: PageSchema,
});

export const collections = { pages };
