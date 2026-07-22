// Test-only Astro fixture (NOT production). Proves the production
// generateId in src/content.config.ts:20 ignores frontmatter `slug`,
// exercising Astro's actual glob() loader with a real build.
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://example.com",
  output: "static",
  trailingSlash: "always",
});
