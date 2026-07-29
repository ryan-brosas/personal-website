import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
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

test("repeated supporting type sizes use semantic roles", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const roles = {
    label: "0.7rem",
    small: "0.9rem",
    meta: "0.78rem",
    emphasis: "1.125rem",
    subheading: "1.25rem",
    control: "0.95rem",
    auxiliary: "0.8rem",
  };
  for (const [role, value] of Object.entries(roles)) {
    assert.ok(css.includes(`--type-${role}-size: ${value};`));
    assert.ok(!css.includes(`font-size: ${value};`));
  }
  assert.match(css, /\.process-diagram figcaption\s*\{[^}]*font-size:\s*var\(--type-label-size\)/s);
  assert.match(css, /\.process-stages small\s*\{[^}]*font-size:\s*var\(--type-small-size\)/s);
  assert.match(css, /\.architecture-map span\s*\{[^}]*font-size:\s*var\(--type-meta-size\)/s);
  assert.match(css, /\.hero__intro\s*\{[^}]*font-size:\s*var\(--type-emphasis-size\)/s);
  assert.match(css, /\.button\s*\{[^}]*font-size:\s*var\(--type-control-size\)/s);
  assert.match(css, /\.freshness-notice\s*\{[^}]*font-size:\s*var\(--type-auxiliary-size\)/s);

  assert.match(css, /\.loop-field__cycle li\s*\{[^}]*font-size:\s*var\(--type-label-size\)/s);
  assert.match(css, /\.case-meta\s*\{[^}]*font-size:\s*var\(--type-meta-size\)/s);
  assert.match(css, /\.prose\s*\{[^}]*font-size:\s*var\(--type-emphasis-size\)/s);

  assert.match(css, /\.case-card__title\s*\{[^}]*font-size:\s*var\(--type-h3-size\)/s);
  assert.match(css, /\.proof-strip strong\s*\{[^}]*font-size:\s*var\(--type-h3-size\)/s);

  // Catching only repeats let every component mint its own rung. The supporting
  // tier drifted to eighteen rendered sizes with 9.6px diagram text, and seven
  // bespoke clamps shadowed the h-levels they sat beside: .case-feature h2 landed
  // 4px off h2, .case-card__title 3px off h3. Every size now resolves to a role
  // declared once in :root, so the fluid scale is defined in exactly one place.
  const rawSizes = [...css.matchAll(/font-size:\s*([^;]+);/g)]
    .map((match) => match[1].trim())
    .filter((value) => !value.startsWith("var("));
  assert.deepEqual(rawSizes, [], "every font-size must consume a semantic role");
});

test("repeated supporting tracking and leading use semantic roles", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  for (const [token, value] of [
    ["tracking-label", "0.1em"],
    ["tracking-meta", "0.08em"],
    ["leading-support", "1.5"],
    ["leading-compact", "1.12"],
  ]) {
    assert.ok(css.includes(`--${token}: ${value};`));
  }
  assert.ok(!css.includes("letter-spacing: 0.1em;"));
  assert.ok(!css.includes("letter-spacing: 0.08em;"));
  assert.ok(!css.includes("line-height: 1.5;"));
  assert.ok(!css.includes("line-height: 1.12;"));
  assert.match(css, /\.workflow-rail__steps span\s*\{[^}]*letter-spacing:\s*var\(--tracking-label\)/s);
  assert.match(css, /\.proof-strip span\s*\{[^}]*letter-spacing:\s*var\(--tracking-meta\)/s);
  assert.match(css, /\.process-stages small\s*\{[^}]*line-height:\s*var\(--leading-support\)/s);
  assert.match(css, /\.case-card__title\s*\{[^}]*line-height:\s*var\(--leading-compact\)/s);

  for (const property of ["line-height", "letter-spacing"]) {
    const values = [...css.matchAll(new RegExp(`${property}:\\s*([^;]+);`, "g"))]
      .map((match) => match[1].trim())
      .filter((value) => !value.startsWith("var("));
    const duplicates = [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
    assert.deepEqual(duplicates, [], `repeated ${property} values must become semantic roles`);
  }
});

test("repeated supporting font weights use semantic roles", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  for (const [token, value] of [
    ["weight-medium", "550"],
    ["weight-emphasis", "600"],
    ["weight-strong", "650"],
  ]) {
    assert.ok(css.includes(`--${token}: ${value};`));
    assert.ok(!css.includes(`font-weight: ${value};`));
  }
  assert.match(css, /\.site-header nav a\s*\{[^}]*font-weight:\s*var\(--weight-medium\)/s);
  assert.match(css, /\.button\s*\{[^}]*font-weight:\s*var\(--weight-emphasis\)/s);
  assert.match(css, /\.eyebrow\s*\{[^}]*font-weight:\s*var\(--weight-strong\)/s);
  const rawWeights = [...css.matchAll(/font-weight:\s*([^;]+);/g)]
    .map((match) => match[1].trim())
    .filter((value) => !value.startsWith("var(") && value !== "inherit");
  assert.deepEqual(rawWeights, ["100 900"], "only the variable-font range remains raw");
});

test("reading typography follows sourced measure and spacing fundamentals", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.match(css, /--measure-narrow:\s*45ch;/);
  assert.match(css, /--measure-reading:\s*38rem;/);
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
  assert.match(css, /@media \(max-width: 820px\)/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(lab, /aria-label="Fluid spacing scale on an 8 pixel rhythm"/);
  for (const label of ["8px", "12–16px", "16–24px", "20–32px", "28–48px", "36–64px"]) {
    assert.ok(lab.includes(`<b>${label}</b>`), `spacing reference includes ${label}`);
  }
  assert.match(lab, /Medium · 601–820px/);
  assert.match(lab, /Wide · above 820px/);
  assert.doesNotMatch(lab, /900px/);
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
  assert.match(lab, /npm run check &amp;&amp; npm run build &amp;&amp; npm test &amp;&amp; npm run verify/);
  assert.doesNotMatch(lab, /npm run check &amp;&amp; npm test &amp;&amp; npm run build/);
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
  assert.match(lab, /Type: \["font-", "type-", "tracking-", "leading-", "weight-", "highlight-"\]/);
  assert.match(lab, /Space: \["space-", "rhythm-", "shell-"\]/);
  assert.match(lab, /Layout: \[[^\]]*"texture-"/);
  assert.match(lab, /Color: \[[^\]]*"canvas\$"/);
  assert.match(lab, /prefix\.endsWith\("\$"\)/);
  const rootBlock = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));
  const tokenNames = [...rootBlock.matchAll(/--([a-z0-9-]+):/g)].map((match) => match[1]);
  const bucketBlock = lab.match(/const buckets:[^{]+\{([\s\S]*?)\n  \};/);
  assert.ok(bucketBlock);
  const prefixes = [...bucketBlock[1].matchAll(/"([a-z-$]+)"/g)].map((match) => match[1]);
  const matchesPrefix = (name, prefix) =>
    prefix.endsWith("$") ? name === prefix.slice(0, -1) : name.startsWith(prefix);
  const memberships = tokenNames.map((name) => ({
    name,
    count: prefixes.filter((prefix) => matchesPrefix(name, prefix)).length,
  }));
  assert.deepEqual(
    memberships.filter(({ count }) => count !== 1),
    [],
    "every root token appears in exactly one generated group",
  );

  assert.match(lab, /globalCss\.indexOf\(":root"\)/);
  assert.match(lab, /matchAll\(\/--\(\[a-z0-9-\]\+\)/);
  assert.match(css, /--motion-fast:\s*160ms;/);
  assert.match(css, /--motion-ease:\s*ease;/);
  assert.match(css, /--motion-process:\s*calc\(var\(--motion-fast\) \* 30\);/);
  assert.match(css, /--motion-process-ease:\s*cubic-bezier\(0\.5, 0, 0\.5, 1\);/);
  assert.match(css, /\.process-rail i\s*\{[^}]*animation:\s*process-travel var\(--motion-process\) var\(--motion-process-ease\)/s);
  assert.doesNotMatch(css, /animation:\s*process-travel 4\.8s/);
  const motionDeclarations = [...css.matchAll(
    /(?:animation(?:-[a-z-]+)?|transition(?:-[a-z-]+)?)\s*:\s*([^;]+);/g,
  )].map((match) => match[1].trim());
  const rawDurations = motionDeclarations.filter(
    (value) => /\d+(?:\.\d+)?(?:ms|s)/.test(value) && value !== "0.01ms !important",
  );
  assert.deepEqual(rawDurations, [], "production motion durations use shared roles");
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("semantic tokens are consumed or explicitly published foundations", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const componentsRoot = path.join(repoRoot, "src", "components");
  const componentCss = fs.readdirSync(componentsRoot, { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".astro"))
    .map((entry) => fs.readFileSync(path.join(componentsRoot, entry), "utf-8"))
    .join("\n");
  const definitions = [...css.matchAll(/^\s*--([a-z0-9-]+)\s*:/gm)].map((match) => match[1]);
  const references = new Set(
    [...(css + componentCss).matchAll(/var\(--([a-z0-9-]+)/g)].map((match) => match[1]),
  );
  const unused = definitions.filter((name) => !references.has(name)).toSorted();
  assert.deepEqual(unused, [
    "color-charcoal",
    "color-coral",
    "color-paper",
    "color-raised",
    "color-signal",
    "space-12",
    "space-16",
  ]);
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
  assert.match(css, /\.case-card__title a\s*\{[^}]*text-underline-offset/s);
  assert.match(css, /\.case-grid li:only-child\s*\{[^}]*grid-column:\s*1 \/ -1/s);
});

test("geometry tokens describe components the system actually ships", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  for (const radius of ["sm", "md", "lg"]) {
    assert.match(css, new RegExp(`--radius-${radius}:`));
  }
  assert.doesNotMatch(css, /--radius-pill:/, "no pill token exists without a pill component");
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.ok(lab.includes("<strong>0 / 2 / 4 / 8</strong><span>Plate, control, panel radius</span>"));
});

test("interactive controls share the minimum target role", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  assert.match(css, /--target-min:\s*2\.75rem;/);
  assert.match(css, /\.site-header nav a\s*\{[^}]*min-height:\s*var\(--target-min\)/s);
  assert.match(css, /\.nav-toggle\s*\{[^}]*min-width:\s*var\(--target-min\)[^}]*min-height:\s*var\(--target-min\)/s);
  assert.doesNotMatch(css, /min-(?:width|height):\s*44px/);
});

test("production radii stay within the approved geometry roles", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const declarations = [...css.matchAll(/border-radius:\s*([^;]+);/g)].map((match) => match[1].trim());
  const approved = new Set(["0", "50%", "var(--radius-sm)", "var(--radius-md)", "var(--radius-lg)"]);

  assert.ok(declarations.length > 0);
  for (const value of declarations) assert.ok(approved.has(value), `unsupported radius: ${value}`);
  assert.equal(declarations.filter((value) => value === "50%").length, 1);
  assert.match(css, /\.homepage-claims li::before\s*\{[^}]*border-radius:\s*50%/s);
});

test("production padding and gaps consume the shared spacing roles", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const declarations = [...css.matchAll(
    /\b(gap|row-gap|column-gap|padding(?:-(?:block|inline)(?:-(?:start|end))?)?|padding-(?:top|right|bottom|left))\s*:\s*([^;]+);/g,
  )].map((match) => ({ property: match[1], value: match[2].trim() }));

  assert.ok(declarations.length > 0);
  for (const declaration of declarations) {
    const values = declaration.value.match(/var\(--[^)]+\)|\S+/g) ?? [];
    assert.ok(
      values.every((value) =>
        value === "0" ||
        /^var\(--(?:space-|rhythm-|shell-)/.test(value) ||
        value === "var(--highlight-inset)",
      ),
      `${declaration.property}: ${declaration.value} uses a spacing role`,
    );
  }
});

test("production margins use spacing roles or documented layout geometry", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const declarations = [...css.matchAll(
    /\bmargin(?:-(?:block|inline)(?:-(?:start|end))?)?\s*:\s*([^;]+);/g,
  )].map((match) => match[1].trim());

  assert.ok(declarations.length > 0);
  for (const value of declarations) {
    const withoutTokens = value.replace(/var\(--[^)]+\)/g, "");
    assert.doesNotMatch(withoutTokens, /\d+(?:\.\d+)?(?:px|r?em|ch|v[wh])/);
  }
  // The rail's 5% inset left the connector ending in open space at both ends,
  // matching neither the stage row edge nor any card centre. It now spans the
  // row, so no margin depends on a proportional guess.
  assert.equal(declarations.filter((value) => value.includes("%")).length, 0);
  assert.doesNotMatch(css, /\.process-rail\s*\{[^}]*margin-inline/s);
});

test("layout rhythm comes from tokens, not per-pattern guesses", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  assert.match(css, /--rhythm-row:\s*var\(--space-3\);/);
  assert.match(css, /--rhythm-block:\s*var\(--space-6\);/);
  assert.match(css, /--rhythm-section:\s*var\(--space-10\);/);
  assert.match(css, /\.page-cta\s*\{[^}]*margin-block-start:\s*var\(--rhythm-section\)/s);
  // Editorial rows and page headers consume the rhythm roles.
  assert.match(css, /\.signal-list li\s*\{[^}]*padding:\s*var\(--rhythm-row\) 0/s);
  assert.match(css, /\.page-header__copy\s*\{[^}]*align-content:\s*start/s);
  assert.doesNotMatch(css, /\.page-header__copy\s*\{[^}]*min-height:\s*30rem/s);
  // The shell gutter is one token so anything bleeding past the content column
  // offsets by the same value main is padded with. Two independent copies drift:
  // a band pinned to --space-3 overflowed once main narrowed to --space-2.
  assert.match(css, /--shell-inline:\s*var\(--space-3\);/);
  assert.match(css, /main\s*\{[^}]*padding:\s*0 var\(--shell-inline\)/s);
  assert.match(
    css,
    /@media \(max-width: 600px\)\s*\{[\s\S]*?:root\s*\{\s*--shell-inline:\s*var\(--space-2\);\s*\}/,
  );
  assert.match(
    css,
    /\.home-section--band\s*\{[^}]*margin-inline:\s*calc\(-1 \* var\(--shell-inline\)\)[^}]*padding-inline:\s*var\(--shell-inline\)/s,
  );
});

test("the proof strip is a complete component, not orphaned responsive rules", () => {
  const css = fs.readFileSync(cssPath, "utf-8");
  const base = css.slice(0, css.indexOf("/* ---------- Responsive ---------- */"));
  const componentPath = path.join(repoRoot, "src", "components", "ProofStrip.astro");
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.equal(fs.existsSync(componentPath), true);
  assert.match(base, /\.proof-strip\s*\{[^}]*display:\s*grid/s);
  assert.match(base, /\.proof-strip li\s*\{/);
  assert.match(lab, /<ProofStrip/);
  assert.doesNotMatch(lab, /<ul class="proof-strip"/);
});

test("Brand Lab renders a live pattern gallery of the production compositions", () => {
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  for (const pattern of [
    "page-header",
    "commercial-hero",
    "entry-header",
    "section-heading",
    "signal-list",
    "process-diagram",
    "proof-strip",
    "homepage-claims",
    "case-feature",
    "dual-list",
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
  assert.match(homeSource, /import BrandSystemLab from "\.\.\/components\/brand\/BrandSystemLab\.astro"/);
  assert.doesNotMatch(homeSource, /await import\("\.\.\/components\/brand\/BrandSystemLab\.astro"\)/);
  assert.match(homeSource, /showBrandLab \? "Ryan Brosas \| Brand Lab"/);
});

test("accessibility evidence is strict and follows the build route manifest", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf-8"));
  assert.equal(packageJson.scripts["a11y:capture"], "node scripts/a11y-capture.mjs --strict");

  const result = spawnSync(process.execPath, ["scripts/a11y-capture.mjs", "--self-test"], {
    cwd: repoRoot,
    encoding: "utf-8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /matrix 288, 32 routes/);
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
  const topLevelComponents = fs.readdirSync(path.join(repoRoot, "src", "components"))
    .filter((entry) => entry.endsWith(".astro"))
    .map((entry) => path.basename(entry, ".astro"));
  for (const component of topLevelComponents) {
    assert.ok(lab.includes(component), `inventories ${component}`);
  }
  const astroSources = fs.readdirSync(path.join(repoRoot, "src"), { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".astro"))
    .map((entry) => ({
      path: entry,
      source: fs.readFileSync(path.join(repoRoot, "src", entry), "utf-8"),
    }));
  const orphaned = topLevelComponents.filter((component) =>
    !astroSources.some(({ path: sourcePath, source }) =>
      sourcePath !== `components/${component}.astro` && source.includes(`${component}.astro`),
    ),
  );
  assert.deepEqual(orphaned, ["FreshnessNotice", "RelatedContent"]);
  assert.match(lab, /FreshnessNotice[^<]*<\/code><\/dt><dd>Reserved until validated dates/);
  assert.match(lab, /RelatedContent<\/code><\/dt><dd>Reserved until relationship records/);
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
