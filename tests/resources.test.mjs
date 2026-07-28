import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const resourcesHub = fs.readFileSync(path.join(repoRoot, "dist", "resources", "index.html"), "utf-8");

test("the resources hub groups public entries by editorial format", () => {
  assert.match(
    resourcesHub,
    /<section class="resource-group" aria-labelledby="resources-checklist">/,
  );
  assert.ok(resourcesHub.includes('<h2 id="resources-checklist">Checklists</h2>'));
  assert.match(resourcesHub, /AI Workflow Readiness Checklist/);
});

test("the resources hub previews the nested wiki as a real term list", () => {
  const source = fs.readFileSync(path.join(repoRoot, "src/pages/resources/index.astro"), "utf-8");
  assert.match(source, /getCollection\("wiki"\)/);
  assert.match(source, /wikiPreview = wikiEntries\.slice\(0, 6\)/);
  assert.match(source, /class="wiki-preview-list"/);
  assert.match(resourcesHub, /href="\/resources\/wiki\/"/);
  assert.match(resourcesHub, /AI workflow wiki/);
  assert.match(resourcesHub, /class="wiki-preview-list"/);
  assert.match(resourcesHub, /href="\/resources\/wiki\/ai-agents\/"/);
  assert.match(resourcesHub, /View all \d+ concepts/);
});

test("the wiki hub groups public terms and links to readable entries", () => {
  const hub = fs.readFileSync(
    path.join(repoRoot, "dist", "resources", "wiki", "index.html"),
    "utf-8",
  );
  assert.match(hub, /<h1[^>]*>AI workflow wiki<\/h1>/);
  assert.match(hub, /aria-labelledby="wiki-ai-workflow-systems"/);
  assert.match(hub, /href="\/resources\/wiki\/ai-agents\/"/);

  const entry = fs.readFileSync(
    path.join(repoRoot, "dist", "resources", "wiki", "ai-agents", "index.html"),
    "utf-8",
  );
  assert.match(entry, /<h1[^>]*>AI agents<\/h1>/);
  assert.match(entry, /<meta name="robots" content="index,follow">/);
  assert.match(entry, /see related concepts on LessWrong/);
});

test("development tools use nested noindex routes without flat duplicates", () => {
  const hub = fs.readFileSync(
    path.join(repoRoot, "dist", "resources", "tools", "index.html"),
    "utf-8",
  );
  assert.match(hub, /<meta name="robots" content="noindex,follow">/);
  assert.match(hub, /href="\/resources\/tools\/llm-watcher\/"/);
  assert.match(hub, /href="\/resources\/tools\/resume-bot\/"/);

  for (const [slug, title] of [["llm-watcher", "LLM Watcher"], ["resume-bot", "Résumé Bot"]]) {
    const html = fs.readFileSync(
      path.join(repoRoot, "dist", "resources", "tools", slug, "index.html"),
      "utf-8",
    );
    assert.match(html, new RegExp(`<h1[^>]*>\\s*${title}\\s*<\\/h1>`));
    assert.match(html, /<meta name="robots" content="noindex,follow">/);
    const canonicalHref = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
    assert.ok(canonicalHref, "tool page emits a canonical URL");
    const canonical = new URL(canonicalHref);
    assert.equal(canonical.protocol, "https:");
    assert.equal(canonical.pathname, `/resources/tools/${slug}/`);
    assert.equal(fs.existsSync(path.join(repoRoot, "dist", "resources", slug)), false);
  }

  const sitemap = fs.readFileSync(path.join(repoRoot, "dist", "sitemap.xml"), "utf-8");
  assert.doesNotMatch(sitemap, /\/resources\/tools\//);
});


test("the wiki hub progressively enhances its complete concept list with search", () => {
  const page = fs.readFileSync(path.join(repoRoot, "src/pages/resources/wiki/index.astro"), "utf-8");
  const enhancement = fs.readFileSync(
    path.join(repoRoot, "src/components/MotionEnhancement.astro"),
    "utf-8",
  );
  const css = fs.readFileSync(path.join(repoRoot, "src/styles/global.css"), "utf-8");

  assert.match(page, /<form class="wiki-filter"[^>]*data-wiki-filter[^>]*hidden/);
  assert.match(page, /type="search"/);
  assert.match(page, /data-wiki-term/);
  assert.match(page, /data-wiki-group/);
  assert.match(page, /data-wiki-filter-empty/);
  assert.doesNotMatch(page, /class="wiki-group-index"/);
  assert.match(enhancement, /data-wiki-filter/);
  assert.match(enhancement, /input\.addEventListener\("input"/);
  assert.match(enhancement, /event\.preventDefault\(\)/);
  assert.match(page, /data-wiki-filter-count aria-live="polite"/);
  assert.match(enhancement, /item\.hidden = !matches/);
  assert.match(css, /\.wiki-filter\[hidden\],[\s\S]*?\{[^}]*display:\s*none/s);
});


test("Resources keeps the directory introduction without the removed circled controls", () => {
  assert.match(resourcesHub, /<h2 id="resources-directory"><a href="\/resources\/directory\/">AI tools directory<\/a><\/h2>/);
  assert.match(resourcesHub, /class="directory-category-list"/);
  assert.match(resourcesHub, /href="\/resources\/directory\/#directory-web-search-research"/);
  assert.doesNotMatch(resourcesHub, /Open all \d+ official links/);
  assert.doesNotMatch(resourcesHub, /class="directory-list"/);
});

test("the separate directory groups neutral official tool references", async () => {
  const { AI_DIRECTORY } = await import("../src/data/ai-directory.ts");
  const categoryIds = AI_DIRECTORY.map((category) => category.id);
  assert.equal(new Set(categoryIds).size, categoryIds.length);
  assert.ok(categoryIds.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)));
  assert.ok(AI_DIRECTORY.every((category) => category.entries.length > 0));
  const entries = AI_DIRECTORY.flatMap((category) => category.entries);
  assert.ok(AI_DIRECTORY.length >= 11);
  assert.ok(entries.length >= 39);
  assert.equal(new Set(entries.map((entry) => entry.name.toLowerCase())).size, entries.length);
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  assert.ok(entries.every((entry) => entry.url.startsWith("https://")));
  const directory = fs.readFileSync(path.join(repoRoot, "dist", "resources", "directory", "index.html"), "utf-8");
  assert.match(directory, /<h1[^>]*>AI tools directory<\/h1>/);
  assert.doesNotMatch(directory, /class="directory-note"/);
  assert.doesNotMatch(directory, /class="directory-category-list"/);
  assert.match(directory, /Web search and research/);
  assert.match(directory, /Speech and audio/);
  assert.match(directory, /Image and media generation/);
  assert.match(directory, /href="https:\/\/www\.anthropic\.com\/"/);
  assert.match(directory, /href="https:\/\/mastra\.ai\/"/);
  assert.doesNotMatch(directory, /\b(?:best|top-ranked|recommended|cheapest)\b/i);
});

test("the separate tools directory progressively enhances its complete list with search", () => {
  const page = fs.readFileSync(path.join(repoRoot, "src/pages/resources/directory.astro"), "utf-8");
  const enhancement = fs.readFileSync(path.join(repoRoot, "src/components/MotionEnhancement.astro"), "utf-8");
  const css = fs.readFileSync(path.join(repoRoot, "src/styles/global.css"), "utf-8");
  assert.match(page, /data-directory-filter[^>]*role="search"[^>]*hidden/);
  assert.match(page, /data-directory-item/);
  assert.match(page, /data-directory-group/);
  assert.match(enhancement, /dataset\.directorySearch/);
  assert.match(enhancement, /directoryItem\.hidden = !matches/);
  assert.match(css, /\.directory-filter\[hidden\]/);
});
