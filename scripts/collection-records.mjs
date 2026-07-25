// W4·T14 (SEO/GEO authority refactor) — Node-side frontmatter reader for the
// case-studies collection. The Astro-runtime consumers (sitemap endpoint, the
// [slug] page, SiteHeader) discover records via getCollection; the build tooling
// (scripts/verify-build.mjs) and tests (tests/shell.test.mjs) cannot call the
// astro:content virtual module, so they read the tracked markdown frontmatter
// here and feed it through the SAME pure `resolveCollectionRoutes` helper. That
// keeps the verifier's expected route set, the sitemap, and the runtime build in
// lockstep from ONE derivation (no hard-coded route/slug literals).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCollectionRoutes } from "../src/lib/site-routes.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(HERE, "..");
const CASE_STUDIES_DIR = path.join(REPO_ROOT, "src", "content", "case-studies");
const CASE_STUDIES_COLLECTION = "case-studies";

// Extract a scalar frontmatter value (quotes optional). Returns undefined when
// the key is absent so the caller can apply a fail-closed default.
const frontmatterValue = (block, key) => {
  const match = block.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m"));
  return match ? match[1].trim() : undefined;
};

// Read the tracked case-study records as { slug, visibility }. Fail-closed: a
// file with no frontmatter or no visibility is treated as draft (never
// discoverable), and the slug falls back to the filename. .gitkeep and non-.md
// files are ignored.
export const readCaseStudyRecords = (dir = CASE_STUDIES_DIR) => {
  if (!fs.existsSync(dir)) return [];
  const records = [];
  for (const name of fs.readdirSync(dir).sort()) {
    if (!name.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(dir, name), "utf-8");
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const block = fm[1];
    const slug = frontmatterValue(block, "slug") ?? name.replace(/\.md$/, "");
    const visibility = frontmatterValue(block, "visibility") ?? "draft";
    records.push({ slug, visibility });
  }
  return records;
};

// The discoverable case-study route inventory derived from tracked content +
// the registry — the single value the verifier and shell manifest consume.
export const caseStudyRoutes = (dir = CASE_STUDIES_DIR) =>
  resolveCollectionRoutes({ [CASE_STUDIES_COLLECTION]: readCaseStudyRecords(dir) });
