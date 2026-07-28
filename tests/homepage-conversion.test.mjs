import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const html = fs.readFileSync(
  path.join(path.resolve(import.meta.dirname, ".."), "dist", "index.html"),
  "utf-8",
);

// Split the rendered homepage into its top-level content sections.
const sections = [...html.matchAll(/<section class="(?:hero[^"]*|home-section)"[\s\S]*?<\/section>/g)].map(
  (m) => m[0],
);

test("every scroll section offers somewhere to go", () => {
  assert.ok(sections.length >= 4, "homepage has its content sections");
  for (const section of sections) {
    const id = section.match(/aria-labelledby="([^"]+)"/)?.[1] ?? section.slice(0, 60);
    assert.match(section, /<a [^>]*href=/, `section "${id}" gives the reader a next step`);
  }
});

test("the homepage opens more than one door", () => {
  const hrefs = new Set(
    [...html.matchAll(/<main[\s\S]*<\/main>/g)][0]
      ?.[0]
      .matchAll(/<a [^>]*href="([^"#]+)"/g) ?? [],
  );
  const paths = new Set([...hrefs].map((m) => m[1]));
  for (const destination of ["/services/", "/case-studies/", "/resources/", "/about/", "/contact/"]) {
    assert.ok(paths.has(destination), `homepage links to ${destination}`);
  }
});
