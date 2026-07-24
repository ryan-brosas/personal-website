import { defineConfig } from "astro/config";
import markdownSafety from "./src/lib/markdown-safety.ts";

// W1·T3: SITE_ORIGIN is injected at build time via env var. In dev/test the
// placeholder "https://example.com" is used silently. In production builds,
// the placeholder is rejected — set SITE_ORIGIN to the real origin before
// running `npm run build` in production.
//
// M2 C1: markdown body safety guard. Astro 5.18.2 hardcodes
// allowDangerousHtml:true and runs custom rehypePlugins before rehypeRaw, so
// this plugin sees raw hast nodes and throws on raw HTML, on* event
// attributes, and javascript:/data: protocols. allowDangerousHtml stays
// default true (do NOT set false — it silently strips instead of failing).

const PLACEHOLDER_ORIGIN = "https://example.com";
const siteOrigin = process.env.SITE_ORIGIN ?? PLACEHOLDER_ORIGIN;

// Guard: throw if SITE_ORIGIN is explicitly set to the placeholder value.
// This catches the operator mistake of copying the placeholder into CI/CD env
// vars. Omitting SITE_ORIGIN entirely is allowed (falls back to placeholder
// silently) so that dev, test, and `astro check` all work without configuration.
// Vite sets NODE_ENV=production internally before evaluating this file, so
// NODE_ENV is not a reliable signal for "real production build" here.
if (process.env.SITE_ORIGIN === PLACEHOLDER_ORIGIN) {
  throw new Error(
    "SITE_ORIGIN must not be the placeholder value in production (e.g. SITE_ORIGIN=https://ryanjosebrosas.dev npm run build)",
  );
}

export default defineConfig({
  site: siteOrigin,
  output: "static",
  trailingSlash: "always",
  markdown: {
    rehypePlugins: [markdownSafety],
  },
});
