import { defineConfig } from "astro/config";
import markdownSafety from "./src/lib/markdown-safety.ts";
import { resolveSiteOrigin } from "./src/lib/site-origin.ts";

// INV-12: SITE_ORIGIN is injected at build time via env var. Resolution +
// the production guard live in the pure `resolveSiteOrigin` (src/lib/site-origin.ts,
// unit-tested in tests/site-origin.test.mjs):
//   • PRODUCTION_BUILD=true → SITE_ORIGIN MUST be a real origin (throws on absent
//     OR placeholder) — Vite forces NODE_ENV=production in every build, so a
//     dedicated PRODUCTION_BUILD signal is the only reliable "real release" marker.
//   • dev/test/preview/`astro check` → absent SITE_ORIGIN silently falls back to the
//     placeholder, but an EXPLICIT placeholder value still throws (operator copy
//     -paste guard).
//
// Markdown body safety: Astro 5.18.2 hardcodes
// allowDangerousHtml:true and runs custom rehypePlugins before rehypeRaw, so
// this plugin sees raw hast nodes and throws on raw HTML, on* event
// attributes, and javascript:/data: protocols. allowDangerousHtml stays
// default true (do NOT set false — it silently strips instead of failing).

const siteOrigin = resolveSiteOrigin(process.env);

export default defineConfig({
  site: siteOrigin,
  output: "static",
  trailingSlash: "always",
  markdown: {
    rehypePlugins: [markdownSafety],
  },
});
