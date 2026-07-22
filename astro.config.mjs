import { defineConfig } from "astro/config";

// M1 (Plan 01): pinned static baseline. Placeholder `site` is allowed during
// local M1-M2 work; production origin is injected at release (Plan 10), whose
// release verifier rejects placeholder origins. See docs/sitemap.md:30.
export default defineConfig({
  site: "https://example.com",
  output: "static",
  trailingSlash: "always",
});
