import { defineConfig } from "astro/config";
import markdownSafety from "./src/lib/markdown-safety.ts";

// M1 (Plan 01): pinned static baseline. Placeholder `site` is allowed during
// local M1-M2 work; production origin is injected at release (Plan 10), whose
// release verifier rejects placeholder origins. See docs/sitemap.md:30.
//
// M2 C1: markdown body safety guard. Astro 5.18.2 hardcodes
// allowDangerousHtml:true and runs custom rehypePlugins before rehypeRaw, so
// this plugin sees raw hast nodes and throws on raw HTML, on* event
// attributes, and javascript:/data: protocols. allowDangerousHtml stays
// default true (do NOT set false — it silently strips instead of failing).
export default defineConfig({
  site: "https://example.com",
  output: "static",
  trailingSlash: "always",
  markdown: {
    rehypePlugins: [markdownSafety],
  },
});
