import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
const html = fs.readFileSync(path.join(repoRoot, "dist", "index.html"), "utf-8");

test("the hero shows the two loops and the handoff between them", () => {
  assert.match(html, /class="loop-field"/);
  assert.equal((html.match(/class="loop-field__cycle"/g) || []).length, 2, "two cycles");
  assert.match(html, /class="loop-field__bridge"/);
  // Both loops are named in text, not implied by shape alone.
  assert.match(html, /Agent loop/i);
  assert.match(html, /Human loop/i);
});

test("the figure sizes to its container, not the viewport", () => {
  assert.match(css, /\.figure-frame \{[^}]*container-type: inline-size/s);
  assert.match(css, /@container \(max-width: [0-9.]+rem\)\s*\{[\s\S]*?\.loop-field \{/);
  // The stage tick must never collapse when a label is long.
  assert.match(css, /\.loop-field__cycle li:not\(\.loop-field__actor\)::before \{[^}]*flex: 0 0 auto/s);
});

test("every loop field carries its container frame", () => {
  // An element cannot query itself, so LoopField owns the frame and consumers
  // cannot accidentally render the field outside its container contract.
  const componentPath = path.join(repoRoot, "src", "components", "LoopField.astro");
  assert.ok(fs.existsSync(componentPath));
  const source = fs.readFileSync(componentPath, "utf-8");
  assert.equal((source.match(/<div class="loop-field">/g) || []).length, 1);
  assert.equal((source.match(/<div class="figure-frame">\s*<div class="loop-field">/g) || []).length, 1);
});

test("the figure is drawn in this system's geometry, not borrowed", () => {
  const field = css.slice(css.indexOf("/* ---------- Loop field"), css.indexOf("/* ---------- Process diagram"));
  assert.doesNotMatch(field, /border-radius: 50%/, "no orbs; this system is rectilinear");
  // Ambient timing derives from the interaction base unit, not per-figure magic numbers.
  assert.match(css, /--motion-ambient: calc\(var\(--motion-fast\)/);
  assert.match(css, /--motion-signal: calc\(var\(--motion-fast\)/);
  assert.doesNotMatch(field, /[0-9.]+s\s/, "durations come from motion tokens");
});

test("the old generic system diagram is gone from the hero", () => {
  assert.doesNotMatch(html, /viewBox="0 0 1000 520"/);
});

test("loop motion is decorative and stops for reduced motion", () => {
  assert.match(css, /@keyframes cycle-step/);
  assert.match(css, /@keyframes handoff-drift/);
  const reduced = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(reduced, "a reduced-motion block exists");
  assert.match(reduced[1], /\.loop-field__track i/);
  // The stage tick animates on a pseudo-element, so only the universal rule
  // can stop it. A per-figure selector silently misses it.
  assert.match(reduced[1], /animation-duration:\s*0\.01ms\s*!important/);
  assert.match(reduced[1], /animation-iteration-count:\s*1\s*!important/);
});

test("the actor row's charcoal fill carries its inverse text", () => {
  // ".loop-field__cycle li" outranks a bare ".loop-field__actor", so an unscoped
  // rule silently loses both the colour and the border resets and renders
  // charcoal on charcoal at 1.73:1. The selector has to clear that specificity.
  const rule = css.match(/\.loop-field__cycle \.loop-field__actor \{([^}]*)\}/);
  assert.ok(rule, "the actor rule is scoped through the cycle");
  assert.match(rule[1], /background: var\(--surface-dark\)/);
  assert.match(rule[1], /color: var\(--text-inverse\)/);
  // A full-bleed fill inside a rounded frame has to clip, or it squares the corners.
  assert.match(css, /\.loop-field__cycle \{[^}]*overflow: hidden/s);
});
