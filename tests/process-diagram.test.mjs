import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
const html = fs.readFileSync(path.join(repoRoot, "dist", "index.html"), "utf-8");

test("the method reads as a pipeline with a travelling rail", () => {
  assert.match(html, /class="process-diagram"/);
  assert.match(html, /class="process-rail" aria-hidden="true"/);
  assert.match(html, /class="process-stages"/);
  // An ordered list, because the stages are a sequence.
  assert.match(html, /<ol class="process-stages">/);
});

test("the final stage is the committed state", () => {
  assert.match(html, /class="is-proven"/);
  const rule = css.match(/\.process-stages \.is-proven\s*\{([^}]*)\}/);
  assert.ok(rule, "the committed stage has its own rule");
  assert.match(rule[1], /var\(--surface-dark\)/);
});

test("the rail animation is motion-safe and token-driven", () => {
  const rail = css.match(/\.process-rail i\s*\{([^}]*)\}/);
  assert.ok(rail, "the rail marker exists");
  assert.match(rail[1], /animation/);
  assert.match(css, /@keyframes process-travel/);
  // The marker must stop moving when the visitor asks for reduced motion.
  const reduced = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(reduced, "a reduced-motion block exists");
  assert.match(reduced[1], /\.process-rail i/);
});
