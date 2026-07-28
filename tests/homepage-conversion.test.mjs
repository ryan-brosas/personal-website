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

test("the homepage moves from problem to solution, proof, fit, and action", () => {
  assert.match(html, /Stop doing the same work[\s\S]*class="brand-highlight">every week\.<\/span>/);
  const order = [
    "hero-title",
    "friction-title",
    "method-title",
    "case-title",
    "fit-title",
    "entry-title",
    "contact-title",
  ].map((id) => html.indexOf(`aria-labelledby="${id}"`));
  assert.ok(order.every((position) => position >= 0), "every stage is present");
  assert.deepEqual(order, [...order].sort((a, b) => a - b), "stages follow the PAS sales path");
});

test("homepage copy stays within a Grade 6 sentence-length range", () => {
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "";
  const blocks = [...main.matchAll(/<(?:h[1-3]|p|small|figcaption)[^>]*>([\s\S]*?)<\/(?:h[1-3]|p|small|figcaption)>/g)]
    .map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " "));
  const sentenceLengths = blocks
    .flatMap((block) => block.split(/[.!?]+/))
    .map((sentence) => sentence.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0)
    .filter(Boolean);
  const average = sentenceLengths.reduce((sum, length) => sum + length, 0) / sentenceLengths.length;
  assert.ok(average <= 12, "average sentence length is " + average.toFixed(1) + " words");
  assert.ok(Math.max(...sentenceLengths) <= 20, "no sentence exceeds 20 words");
});
