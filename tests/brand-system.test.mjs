import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cssPath = path.join(repoRoot, "src", "styles", "global.css");
const distHomePath = path.join(repoRoot, "dist", "index.html");

test("brand typography centrally defines a distinct H1–H6 hierarchy", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  for (const level of [1, 2, 3, 4, 5, 6]) {
    for (const property of ["size", "leading", "tracking", "weight"]) {
      const token = `type-h${level}-${property}`;
      assert.match(css, new RegExp(`--${token}\\s*:`), `global.css defines --${token}`);
    }
    assert.match(
      css,
      new RegExp(`h${level}\\s*\\{[^}]*var\\(--type-h${level}-size\\)`, "s"),
      `h${level} consumes its central size role`,
    );
  }
});

test("H1–H6 use a restrained conventional reading hierarchy", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const expected = {
    1: ["0.98", "-0.045em", "720"],
    2: ["1.02", "-0.035em", "700"],
    3: ["1.08", "-0.025em", "680"],
    4: ["1.15", "-0.015em", "660"],
    5: ["1.28", "0", "650"],
    6: ["1.4", "0.1em", "700"],
  };
  // Sizes are fluid, so pin the shape of the scale rather than literal strings:
  // every level interpolates with a vw term, and the hierarchy stays strictly
  // descending at both ends of the viewport range.
  const bounds = [];
  for (const [level, [leading, tracking, weight]] of Object.entries(expected)) {
    const size = css.match(new RegExp(`--type-h${level}-size: (clamp\\([^;]+\\));`));
    assert.ok(size, `h${level} declares a fluid size`);
    const parts = size[1].match(/clamp\(([0-9.]+)rem, [0-9.]+rem \+ [0-9.]+vw, ([0-9.]+)rem\)/);
    assert.ok(parts, `h${level} interpolates between a floor and a ceiling`);
    bounds.push({ level, min: parseFloat(parts[1]), max: parseFloat(parts[2]) });
    assert.ok(css.includes(`--type-h${level}-leading: ${leading};`));
    assert.ok(css.includes(`--type-h${level}-tracking: ${tracking};`));
    assert.ok(css.includes(`--type-h${level}-weight: ${weight};`));
  }
  for (let i = 1; i < bounds.length; i += 1) {
    assert.ok(bounds[i].min < bounds[i - 1].min, `h${bounds[i].level} floor sits below h${bounds[i - 1].level}`);
    assert.ok(bounds[i].max < bounds[i - 1].max, `h${bounds[i].level} ceiling sits below h${bounds[i - 1].level}`);
  }
  assert.doesNotMatch(css, /\.case-study-header h1\s*\{[^}]*font-size:/s);
});

test("reading typography follows sourced measure and spacing fundamentals", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.match(css, /--measure-narrow:\s*45ch;/);
  assert.match(css, /--measure-reading:\s*66ch;/);
  assert.match(css, /--measure-wide:\s*72ch;/);
  assert.match(css, /--prose-max:\s*var\(--measure-reading\);/);
  assert.match(css, /\.page-lead,[^}]*max-width:\s*var\(--measure-narrow\)/s);
  assert.match(lab, /W3C Text Spacing/);
  assert.match(lab, /U\.S\. Web Design System Typography/);
  assert.match(lab, /MDN line-height/);
});

test("Brand Lab organizes foundations before components and compositions", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  for (const group of ["Foundations", "Components", "Compositions", "Build", "Operations"]) {
    assert.match(lab, new RegExp(`label: "${group}"`));
  }
  assert.match(css, /--grid-columns-compact:\s*4;/);
  assert.match(css, /--grid-columns-medium:\s*8;/);
  assert.match(css, /--grid-columns-wide:\s*16;/);
  assert.match(lab, /Carbon 2x Grid/);
  assert.match(lab, /W3C Contrast Minimum/);
  assert.match(lab, /W3C Non-text Contrast/);
  assert.match(lab, /USWDS Using Color/);
});

test("Brand Lab publishes build recipes that match real project contracts", () => {
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.match(lab, /id=["']brand-recipes["']/);
  assert.match(lab, /id=["']brand-inventory["']/);
  for (const layout of ["CommercialLayout", "CaseStudyLayout", "BaseLayout"]) {
    assert.match(lab, new RegExp(layout));
  }
  for (const contract of ["routeId", "visibility", "ROUTE_REGISTRY", "src/config/routes.ts"]) {
    assert.ok(lab.includes(contract), `documents the ${contract} contract`);
  }
  for (const component of ["EvidenceNote", "Breadcrumbs", "RelatedContent", "FreshnessNotice", "Byline", "JsonLd"]) {
    assert.ok(lab.includes(component), `inventories ${component}`);
  }
  assert.match(lab, /npm run check &amp;&amp; npm test &amp;&amp; npm run build &amp;&amp; npm run verify/);
});

test("Brand Lab documents reusable copy and icon inventory", () => {
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  const sprite = fs.readFileSync(
    path.join(repoRoot, "src", "assets", "brand", "icons.svg"),
    "utf-8",
  );
  assert.match(lab, /id=["']brand-copy["']/);
  assert.match(lab, /id=["']brand-checklist["']/);
  const symbols = [...sprite.matchAll(/<symbol id="(icon-[a-z-]+)"/g)].map((m) => m[1]);
  assert.ok(symbols.length >= 10, "sprite exposes the shared icon set");
  assert.match(lab, /import iconSprite from "\.\.\/\.\.\/assets\/brand\/icons\.svg\?raw";/);
  assert.match(lab, /const iconNames = \[\.\.\.iconSprite\.matchAll\(/);
  assert.match(lab, /<use href=\{`#\$\{name\}`\} \/>/);
});

test("Brand Lab derives a token reference and states the motion policy", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.match(lab, /id=["']brand-tokens["']/);
  assert.match(lab, /id=["']brand-motion["']/);
  assert.match(lab, /readFileSync\(new URL\("\.\.\/\.\.\/styles\/global\.css", import\.meta\.url\), "utf-8"\)/);
  assert.match(lab, /globalCss\.indexOf\(":root"\)/);
  assert.match(lab, /matchAll\(\/--\(\[a-z0-9-\]\+\)/);
  assert.match(css, /--motion-fast:\s*160ms;/);
  assert.match(css, /--motion-ease:\s*ease;/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("structural panels carry the grid texture without touching reading surfaces", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  assert.match(css, /--texture-grid-size:\s*2rem;/);
  assert.match(css, /--canvas-grid-inverse:\s*rgba\(247, 242, 225, 0\.09\);/);
  assert.match(css, /\.page-visual--about,\n\.case-feature__visual\s*\{/);
  // Both panels set the `background` shorthand, so the texture rule must come
  // after their declarations or it is silently reset to none.
  const textureAt = css.indexOf("--canvas-grid-inverse) 1px");
  assert.ok(textureAt > css.indexOf(".cta-panel {"));
  assert.ok(textureAt > css.indexOf(".site-footer__inner {"));
  // The reading canvas and prose surfaces stay flat.
  assert.doesNotMatch(css, /^body\s*\{[^}]*background-image/ms);
  assert.doesNotMatch(css, /\.prose\s*\{[^}]*background-image/s);
});

test("card headings keep their underline clear of the following copy", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  assert.match(css, /\.case-card h2 a\s*\{[^}]*text-underline-offset/s);
  assert.match(css, /\.case-grid li:only-child\s*\{[^}]*grid-column:\s*1 \/ -1/s);
});

test("layout rhythm comes from tokens, not per-pattern guesses", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  assert.match(css, /--rhythm-row:\s*var\(--space-3\);/);
  assert.match(css, /--rhythm-block:\s*var\(--space-6\);/);
  assert.match(css, /--rhythm-section:\s*var\(--space-10\);/);
  // Editorial rows and page headers consume the rhythm roles.
  assert.match(css, /\.signal-list li\s*\{[^}]*padding:\s*var\(--rhythm-row\) 0/s);
  assert.match(css, /\.page-header__copy\s*\{[^}]*align-content:\s*start/s);
  assert.doesNotMatch(css, /\.page-header__copy\s*\{[^}]*min-height:\s*30rem/s);
});

test("the proof strip is a complete component, not orphaned responsive rules", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const base = css.slice(0, css.indexOf("/* ---------- Responsive ---------- */"));
  assert.match(base, /\.proof-strip\s*\{[^}]*display:\s*grid/s);
  assert.match(base, /\.proof-strip li\s*\{/);
});

test("Brand Lab renders a live pattern gallery of the production compositions", () => {
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  for (const pattern of [
    "page-header",
    "signal-list",
    "process-diagram",
    "proof-strip",
    "case-card",
    "cta-panel",
  ]) {
    assert.ok(
      lab.includes(`data-pattern="${pattern}"`),
      `gallery renders a live ${pattern} example`,
    );
  }
});

test("only the first card in a grid gets the charcoal treatment", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  // `.case-card:first-child` matches every card, because each card is the only
  // child of its <li>. The variant must be scoped to the first grid item.
  assert.doesNotMatch(css, /\.case-card:first-child/);
  assert.match(css, /\.case-grid li:first-child \.case-card\s*\{/);
});

test("production homepage consumes BrandHeading but excludes the local Brand Lab", () => {
  const html = fs.readFileSync(distHomePath, "utf-8");
  assert.match(html, /<h1[^>]+class="brand-heading brand-heading--h1 hero__title"/);
  assert.ok(!html.includes("data-brand-lab"), "Brand Lab is absent from production output");
});

test("Brand Lab has one explicit development command", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf-8"));
  assert.equal(
    packageJson.scripts["brand:lab"],
    "PUBLIC_BRAND_LAB=true astro dev --host 0.0.0.0 --port 4325 --mode brand-lab",
  );
  const homeSource = fs.readFileSync(path.join(repoRoot, "src", "pages", "index.astro"), "utf-8");
  assert.match(homeSource, /import\.meta\.env\.PUBLIC_BRAND_LAB === "true"/);
  assert.match(homeSource, /showBrandLab \? "Ryan Brosas \| Brand Lab"/);
});

test("adopted illustrations use the original approved palette", () => {
  const operator = fs.readFileSync(
    path.join(repoRoot, "src", "assets", "brand", "operator-mascot.svg"),
    "utf-8",
  );
  const systemMap = fs.readFileSync(
    path.join(repoRoot, "src", "assets", "brand", "hero-system-conductor.svg"),
    "utf-8",
  );
  for (const artwork of [operator, systemMap]) {
    assert.match(artwork, /#ecc90f/i);
    assert.match(artwork, /#1a1a1a/i);
    assert.doesNotMatch(artwork, /#c9e83a|#f05a45|#2f7668|#405158/i);
  }
});

test("Brand Lab uses a restrained visual role for its semantic page heading", () => {
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.ok(
    lab.includes(
      '<BrandHeading level={1} role="h2" class="brand-lab__title" id="brand-lab-title">',
    ),
  );
});

test("Brand Lab centralizes the working brand inventory", () => {
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  for (const section of [
    "identity",
    "foundations",
    "contrast",
    "typography",
    "layout",
    "assets",
    "actions",
    "forms",
    "states",
    "patterns",
    "voice",
    "governance",
  ]) {
    assert.match(lab, new RegExp(`id=["']brand-${section}["']`), `includes the ${section} reference`);
  }
  assert.match(lab, /Verified/);
  assert.match(lab, /Proposed/);
  assert.match(lab, /Still needed:/);
  assert.match(lab, /Ryan-Brosas-Brand-System-Design-System/);
});

test("components consume semantic roles instead of raw pigments", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const declarations = [...css.matchAll(/(?:background|background-color|color|border-color)\s*:\s*([^;}]+)/g)]
    .map((match) => match[1])
    .filter((value) => /#[0-9a-f]{3,8}/i.test(value));
  assert.deepEqual(declarations, [], "no component declares a raw hex outside :root");
});

test("every focusable element carries a visible offset focus ring", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  // The hero no longer sits on a signal-yellow field, so the global ring governs.
  const focusRule = css.match(/\n:focus-visible\s*{([^}]*)}/s);
  assert.ok(focusRule, "a global :focus-visible rule exists");
  // Two tones, so the ring clears 3:1 on paper, coral and charcoal alike.
  assert.match(focusRule[1], /outline: [^;]*var\(--text-1\)/);
  assert.match(focusRule[1], /box-shadow: [^;]*var\(--canvas\)/);
  assert.match(focusRule[1], /outline-offset/);
});

test("Brand Lab presents the canonical H1–H6 hierarchy without tuning controls", () => {
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.match(lab, /Technical editorial hierarchy/);
  for (const level of [1, 2, 3, 4, 5, 6]) {
    assert.match(lab, new RegExp(`brand-heading--h${level}|role="h${level}"`));
  }
  assert.ok(!lab.includes("data-brand-control"), "Brand Lab has no heading-size sliders");
  assert.ok(!lab.includes("<form"), "Brand Lab is a reference, not a tuning form");
});
