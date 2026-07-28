import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const css = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf-8");
const brandLab = readFileSync(
  new URL("../src/components/brand/BrandSystemLab.astro", import.meta.url),
  "utf-8",
);

const token = (name) => {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  assert.ok(match, `missing color token --${name}`);
  return match[1];
};

const luminance = (hex) => {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((part) => Number.parseInt(part, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrast = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

describe("semantic color contrast", () => {
  test("muted small text remains at least 4.5:1 on light surfaces", () => {
    for (const surface of ["canvas", "surface", "surface-muted"]) {
      assert.ok(contrast(token("text-3"), token(surface)) >= 4.5, surface);
    }
  });

  test("control boundaries meet non-text contrast on light surfaces", () => {
    assert.ok(contrast(token("control-border"), token("canvas")) >= 3);
    assert.ok(contrast(token("control-border"), token("surface")) >= 3);
    assert.match(brandLab, /\.brand-lab__fieldset input\s*\{[^}]*border:\s*1px solid var\(--control-border\)/s);
  });

  test("the focus ring remains at least 3:1 on light and dark surfaces", () => {
    for (const surface of ["canvas", "surface", "surface-dark"]) {
      assert.ok(contrast(token("focus-ring"), token(surface)) >= 3, surface);
    }
  });
  test("the original four pigments keep distinct semantic roles", () => {
    assert.equal(token("canvas"), "#fdf9e5");
    assert.equal(token("surface-dark"), "#1a1a1a");
    assert.equal(token("brand"), "#ff5555");
    assert.equal(token("signal"), "#ecc90f");
    assert.equal(token("text-1"), token("surface-dark"));
    assert.notEqual(token("brand"), token("signal"));
  });

  test("brand pairings preserve their intended accessibility roles", () => {
    assert.ok(contrast(token("text-1"), token("brand")) >= 4.5, "charcoal on coral");
    assert.ok(contrast(token("text-1"), token("signal")) >= 7, "charcoal on signal yellow");
    assert.ok(contrast(token("text-inverse"), token("surface-dark")) >= 7, "warm inverse on charcoal");
  });

  test("coral component surfaces keep all copy on the approved charcoal role", () => {
    assert.match(
      brandLab,
      /\.brand-lab__governance article:last-child\s*\{[^}]*color:\s*var\(--text-1\)/s,
    );
    assert.match(
      brandLab,
      /\.brand-lab__governance article:last-child p\s*\{[^}]*color:\s*inherit/s,
    );
    assert.match(
      brandLab,
      /\.brand-lab__status-card--proposed p\s*\{[^}]*color:\s*inherit/s,
    );
  });

  test("brand accents that fail text contrast stay decorative", () => {
    assert.ok(contrast(token("text-inverse"), token("brand")) < 3, "inverse on coral is not text-safe");
    assert.ok(contrast(token("brand"), token("canvas")) < 4.5, "coral on paper is not body-text-safe");
  });

  test("--brand-strong never carries or backs text", () => {
    // It reads as a safe "darker coral" but fails AA in both directions, so
    // the guard is structural rather than a reviewer remembering to check.
    assert.ok(contrast(token("text-inverse"), token("brand-strong")) < 4.5);
    assert.ok(contrast(token("brand-strong"), token("canvas")) < 4.5);
    assert.doesNotMatch(css, /(?:^|[;{]\s*)(?:background|color):\s*var\(--brand-strong\)/m);
  });

});
