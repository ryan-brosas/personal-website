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
    assert.match(html, new RegExp(`<link rel="canonical" href="https:\/\/example\.com\/resources\/tools\/${slug}\/">`));
    assert.equal(fs.existsSync(path.join(repoRoot, "dist", "resources", slug)), false);
  }

  const sitemap = fs.readFileSync(path.join(repoRoot, "dist", "sitemap.xml"), "utf-8");
  assert.doesNotMatch(sitemap, /\/resources\/tools\//);
});
