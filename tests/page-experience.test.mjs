import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const distRoot = path.join(repoRoot, "dist");
const sitemap = fs.readFileSync(path.join(distRoot, "sitemap.xml"), "utf-8");
const publicHtmlRoutes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => new URL(match[1]).pathname)
  .filter((route) => route !== "/" && route.endsWith("/"));

const readRoute = (route) =>
  fs.readFileSync(path.join(distRoot, route.slice(1), "index.html"), "utf-8");

const orientationRoutes = new Set(["/services/", "/case-studies/", "/resources/"]);

test("the sitemap discovers every public non-home HTML route under test", () => {
  assert.ok(publicHtmlRoutes.length > 0);
  assert.ok(publicHtmlRoutes.every((route) => route.endsWith("/")));
  assert.ok(!publicHtmlRoutes.includes("/"));
});

test("workflow rails appear only where they orient a service or collection", () => {
  for (const route of publicHtmlRoutes) {
    const html = readRoute(route);
    if (orientationRoutes.has(route)) {
      assert.match(html, /class="workflow-rail"/, route + " uses the orientation rail");
      assert.match(html, /class="workflow-rail__steps"/, route + " exposes every ordered step");
    } else {
      assert.doesNotMatch(html, /class="workflow-rail"/, route + " does not repeat its main content");
    }
  }
});

test("every public non-home HTML route offers a clear next step", () => {
  for (const route of publicHtmlRoutes) {
    const html = readRoute(route);
    if (route === "/contact/") {
      assert.match(html, /class="contact-action-panel"/, "contact places its action in the hero");
      assert.doesNotMatch(html, /class="page-cta cta-panel"/, "contact does not repeat its action");
    } else {
      assert.match(html, /class="page-cta cta-panel"/, route + " renders the shared closing CTA");
    }
    assert.match(html, /class="button button--primary"/, route + " offers a primary action");
  }
});

test("resource discovery pages lead with a useful low-commitment action", () => {
  for (const route of ["/resources/", "/resources/tools/", "/resources/wiki/"]) {
    const html = readRoute(route);
    const cta = html.slice(html.indexOf('class="page-cta cta-panel"'));
    assert.match(
      cta,
      /href="\/resources\/ai-workflow-readiness\/"[^>]*>Use the checklist<\/a>/,
      route + " leads to the readiness checklist",
    );
  }
});

test("resource groups keep descriptions close and adjacent groups separated", () => {
  const page = fs.readFileSync(
    path.join(repoRoot, "src", "pages", "resources", "index.astro"),
    "utf-8",
  );
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(
    page,
    /<section class="resource-group" aria-labelledby="resources-wiki">[\s\S]*?<SectionHeading[\s\S]*?id="resources-wiki"[\s\S]*?<p>Short definitions[\s\S]*?<ul class="wiki-preview-list">[\s\S]*?View all \{wikiEntries\.length\} concepts[\s\S]*?<\/section>/,
  );
  assert.doesNotMatch(
    page,
    /aria-labelledby="resources-wiki"[\s\S]{0,500}<p class="page-lead">/,
  );
  assert.match(
    css,
    /\.resource-group \+ \.resource-group\s*\{[^}]*margin-block-start:\s*var\(--rhythm-section\)/s,
  );
});

test("homepage lists and process patterns share their Brand Lab components", () => {
  const patterns = [
    ["SignalList", "signal-list"],
    ["ProcessDiagram", "process-diagram"],
    ["EntryPoints", "entry-points"],
  ];
  const home = fs.readFileSync(path.join(repoRoot, "src", "pages", "index.astro"), "utf-8");
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );

  for (const [componentName, className] of patterns) {
    const componentPath = path.join(repoRoot, "src", "components", `${componentName}.astro`);
    assert.ok(fs.existsSync(componentPath), `${componentName} owns its pattern markup`);
    const component = fs.readFileSync(componentPath, "utf-8");
    assert.match(component, new RegExp(`class="${className}"`));
    assert.match(home, new RegExp(`import ${componentName}`));
    assert.match(home, new RegExp(`<${componentName}`));
    assert.match(lab, new RegExp(`import ${componentName}`));
    assert.match(lab, new RegExp(`<${componentName}`));
    assert.doesNotMatch(home, new RegExp(`<(?:ol|ul|figure) class="${className}"`));
    assert.doesNotMatch(lab, new RegExp(`<(?:ol|ul|figure) class="${className}"`));
  }
});

test("the homepage outcome columns are a shared Brand Lab composition", () => {
  const componentPath = path.join(repoRoot, "src", "components", "OutcomeColumns.astro");
  assert.ok(fs.existsSync(componentPath), "OutcomeColumns owns the two-column list");
  const component = fs.readFileSync(componentPath, "utf-8");
  assert.match(component, /class="dual-list"/);

  const home = fs.readFileSync(path.join(repoRoot, "src", "pages", "index.astro"), "utf-8");
  assert.match(home, /import OutcomeColumns/);
  assert.match(home, /<OutcomeColumns/);
  assert.doesNotMatch(home, /<div class="dual-list">/);

  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.match(lab, /data-pattern="dual-list"/);
  assert.match(lab, /<OutcomeColumns/);
});

test("the homepage renders the source-backed résumé bot feature as a semantic proof list", () => {
  const home = readRoute("/");
  assert.match(home, /<h2[^>]*id="case-title"[^>]*>Ask one question\. See the source\.<\/h2>/i);
  assert.match(home, /href="\/case-studies\/mastra-resume-bot\/"/i);
  assert.match(home, /<ul class="architecture-map"[^>]*aria-label="Résumé bot proof map"/i);
  for (const [label, status] of [
    ["Résumé", "versioned"],
    ["Answers", "source-bound"],
    ["Citations", "page-linked"],
    ["Failures", "controlled"],
  ]) {
    assert.match(home, new RegExp(`<li>\\s*<strong>${label}<\\/strong>\\s*<span>${status}<\\/span>\\s*<\\/li>`, "i"));
  }
  assert.doesNotMatch(home, /class="case-feature__visual"[^>]*aria-hidden/i);
  assert.doesNotMatch(home, /This site shows how the rules work\./);
});

test("the homepage delegates its hero and loop diagram to shared components", () => {
  const heroPath = path.join(repoRoot, "src", "components", "HomeHero.astro");
  const loopPath = path.join(repoRoot, "src", "components", "LoopField.astro");
  assert.ok(fs.existsSync(heroPath), "HomeHero owns the homepage opening");
  assert.ok(fs.existsSync(loopPath), "LoopField owns the two-loop diagram");

  const hero = fs.readFileSync(heroPath, "utf-8");
  const loop = fs.readFileSync(loopPath, "utf-8");
  assert.match(hero, /class="hero"/);
  assert.match(hero, /<LoopField/);
  assert.match(loop, /<div class="figure-frame">\s*<div class="loop-field">/);

  const home = fs.readFileSync(path.join(repoRoot, "src", "pages", "index.astro"), "utf-8");
  assert.match(home, /import HomeHero/);
  assert.match(home, /<HomeHero/);
  assert.doesNotMatch(home, /<section class="hero"|<div class="loop-field">/);

  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.match(lab, /import LoopField/);
  assert.match(lab, /<LoopField/);
  assert.doesNotMatch(lab, /<div class="loop-field">/);
});

test("commercial pages delegate their cohesive hero to one component", () => {
  const componentPath = path.join(repoRoot, "src", "components", "CommercialHero.astro");
  assert.ok(fs.existsSync(componentPath), "CommercialHero owns the route-specific visual composition");
  const component = fs.readFileSync(componentPath, "utf-8");
  assert.match(component, /class="page-header commercial-hero"/);
  for (const variant of ["about", "services", "contact"]) {
    assert.match(component, new RegExp(`page-visual--${variant}`));
  }

  const route = fs.readFileSync(path.join(repoRoot, "src", "pages", "[page].astro"), "utf-8");
  assert.match(route, /import CommercialHero/);
  assert.match(route, /<CommercialHero/);
  assert.doesNotMatch(route, /<header class="page-header commercial-hero">/);
  assert.doesNotMatch(route, /HeroOperator|HeroSystemMap/);
});

test("editorial entries use one shared header composition", () => {
  const componentPath = path.join(repoRoot, "src", "components", "EntryHeader.astro");
  assert.ok(fs.existsSync(componentPath), "EntryHeader owns the repeated entry heading markup");
  const component = fs.readFileSync(componentPath, "utf-8");
  assert.match(component, /class="case-study-header"/);
  assert.match(component, /class="case-study-lead"/);
  assert.match(component, /headingLevel/);

  for (const relativePath of [
    "src/pages/case-studies/[slug].astro",
    "src/pages/resources/[slug].astro",
    "src/pages/resources/tools/[slug].astro",
    "src/pages/resources/wiki/[slug].astro",
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf-8");
    assert.match(source, /import EntryHeader/);
    assert.match(source, /<EntryHeader/);
    assert.doesNotMatch(source, /<header class="case-study-header">/);
  }
});

test("editorial entries render the validated site-author byline", () => {
  for (const relativePath of [
    "src/pages/case-studies/[slug].astro",
    "src/pages/resources/[slug].astro",
    "src/pages/resources/tools/[slug].astro",
    "src/pages/resources/wiki/[slug].astro",
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf-8");
    assert.match(source, /import Byline/);
    assert.match(source, /<EntryHeader[\s\S]*?<Byline \/>/);
  }
});

test("first prose headings do not add phantom section spacing", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  // Both stay on the adjacent-sibling combinator, so the first heading in a block
  // still gets no top margin. They take different steps because sharing one made
  // the three h3 headings inside a section read as three more sections.
  assert.match(css, /\.prose > \* \+ h2\s*\{[^}]*margin-block-start:\s*var\(--prose-section\)/s);
  assert.match(css, /\.prose > \* \+ h3\s*\{[^}]*margin-block-start:\s*var\(--prose-subsection\)/s);
  assert.match(css, /\.prose > \* \+ \*\s*\{[^}]*margin-block-start:\s*var\(--prose-paragraph\)/s);
  assert.doesNotMatch(css, /\.prose h2,\s*\.prose h3\s*\{[^}]*margin-block-start/s);

  // The ladder must not invert at any width, so every step is a fixed length.
  // A viewport-clamped step shrinks as the screen narrows while a leading-derived
  // paragraph gap does not: at 390px the two crossed, and an h3 sat 29px below its
  // previous block where ordinary paragraph breaks took 34px.
  const stepPx = (token) => {
    const declared = css.match(new RegExp("--" + token + ":\\s*([0-9.]+)(rem|em);"));
    assert.ok(declared, "--" + token + " is a fixed length, not a clamp");
    // em resolves against the prose font-size (--type-emphasis-size, 1.125rem).
    return parseFloat(declared[1]) * (declared[2] === "em" ? 18 : 16);
  };
  const paragraph = stepPx("prose-paragraph");
  const subsection = stepPx("prose-subsection");
  const section = stepPx("prose-section");
  assert.ok(subsection > paragraph, "subsection " + subsection + "px must clear paragraph " + paragraph + "px");
  assert.ok(section > subsection, "section " + section + "px must clear subsection " + subsection + "px");
});

test("entry bylines keep a shared gap before prose", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(
    css,
    /\.byline \+ \.prose\s*\{[^}]*margin-block-start:\s*var\(--space-4\)/s,
  );
});

test("page headers use one shared route-title composition", () => {
  const componentPath = path.join(repoRoot, "src", "components", "PageHeader.astro");
  assert.ok(fs.existsSync(componentPath), "PageHeader owns the repeated route-title composition");
  const component = fs.readFileSync(componentPath, "utf-8");
  assert.match(component, /class:list=\{\["page-header"/);
  assert.match(component, /<h1 id=\{id\}>\{title\}<\/h1>/);
  assert.match(component, /class="page-lead"/);

  for (const relativePath of [
    "src/pages/404.astro",
    "src/pages/case-studies/index.astro",
    "src/pages/resources/index.astro",
    "src/pages/resources/tools/index.astro",
    "src/pages/resources/wiki/index.astro",
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf-8");
    assert.match(source, /import PageHeader/);
    assert.match(source, /<PageHeader/);
    assert.doesNotMatch(source, /<header class="page-header">/);
  }
});

test("section headings use one shared composition", () => {
  const componentPath = path.join(repoRoot, "src", "components", "SectionHeading.astro");
  assert.ok(fs.existsSync(componentPath), "SectionHeading owns the repeated heading composition");
  const component = fs.readFileSync(componentPath, "utf-8");
  assert.match(component, /class:list=\{\["section-heading"/);
  assert.match(component, /<h2 id=\{id\}>\{titleHref \? <a href=\{titleHref\}>\{title\}<\/a> : title\}<\/h2>/);

  for (const relativePath of [
    "src/pages/index.astro",
    "src/pages/resources/index.astro",
    "src/pages/resources/wiki/index.astro",
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf-8");
    assert.match(source, /import SectionHeading/);
    assert.match(source, /<SectionHeading/);
    assert.doesNotMatch(source, /<div class="section-heading">/);
  }
});

test("CTA panels share one base composition", () => {
  const componentPath = path.join(repoRoot, "src", "components", "CtaPanel.astro");
  assert.ok(fs.existsSync(componentPath), "CtaPanel owns the repeated panel markup");
  const component = fs.readFileSync(componentPath, "utf-8");
  assert.match(component, /"cta-panel"/);
  assert.match(component, /aria-labelledby=\{id\}/);

  for (const relativePath of [
    "src/components/PageCta.astro",
    "src/components/brand/BrandSystemLab.astro",
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf-8");
    assert.match(source, /import CtaPanel/);
    assert.match(source, /<CtaPanel/);
    assert.doesNotMatch(source, /<(?:div|section) class="[^"]*cta-panel/);
  }

  const homepage = fs.readFileSync(path.join(repoRoot, "src/pages/index.astro"), "utf-8");
  assert.match(homepage, /import PageCta/);
  assert.match(homepage, /<PageCta/);
  assert.doesNotMatch(homepage, /import CtaPanel|<CtaPanel/);
});

test("contact and page CTAs share one action-links component", () => {
  const actionLinks = fs.readFileSync(path.join(repoRoot, "src", "components", "ActionLinks.astro"), "utf-8");
  const pageCta = fs.readFileSync(path.join(repoRoot, "src", "components", "PageCta.astro"), "utf-8");
  const commercialHero = fs.readFileSync(path.join(repoRoot, "src", "components", "CommercialHero.astro"), "utf-8");
  assert.match(actionLinks, /class:list=\{\["button-row"/);
  assert.match(pageCta, /import ActionLinks/);
  assert.match(pageCta, /<ActionLinks/);
  assert.match(commercialHero, /import ActionLinks/);
  assert.match(commercialHero, /<ActionLinks/);
});

test("secondary buttons remain readable when inverted panels use a light hover surface", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(css, /\.page-cta \.button--secondary:hover\s*\{[^}]*color:\s*var\(--text-1\)[^}]*border-color:\s*var\(--text-1\)/s);
  assert.match(css, /\.case-feature__copy \.button--secondary:hover\s*\{[^}]*color:\s*var\(--text-1\)[^}]*border-color:\s*var\(--text-1\)/s);
});

test("collection cards share one semantic-level-independent component", () => {
  const componentPath = path.join(repoRoot, "src", "components", "CollectionCard.astro");
  assert.ok(fs.existsSync(componentPath), "CollectionCard owns collection article markup");
  const component = fs.readFileSync(componentPath, "utf-8");
  assert.match(component, /class:list=\{\["case-card"/);
  assert.match(component, /class="case-card__title"/);
  assert.match(component, /headingLevel/);

  for (const relativePath of [
    "src/pages/case-studies/index.astro",
    "src/pages/resources/index.astro",
    "src/pages/resources/tools/index.astro",
    "src/pages/resources/wiki/index.astro",
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf-8");
    assert.match(source, /import CollectionCard/);
    assert.match(source, /<CollectionCard/);
    assert.doesNotMatch(source, /<article class="case-card">/);
  }

  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(css, /\.case-card__title\s*\{/);
  assert.doesNotMatch(css, /\.case-card h2\s*\{/);
});

test("collection hubs choose explicit compact card density", () => {
  const header = fs.readFileSync(path.join(repoRoot, "src", "components", "PageHeader.astro"), "utf-8");
  const card = fs.readFileSync(path.join(repoRoot, "src", "components", "CollectionCard.astro"), "utf-8");
  const wiki = fs.readFileSync(path.join(repoRoot, "src", "pages", "resources", "wiki", "index.astro"), "utf-8");
  const tools = fs.readFileSync(path.join(repoRoot, "src", "pages", "resources", "tools", "index.astro"), "utf-8");
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");

  assert.match(header, /titleMeasure/);
  assert.match(header, /page-header--wide-title/);
  assert.match(card, /density/);
  assert.match(card, /case-card--compact/);
  assert.match(wiki, /titleMeasure="wide"/);
  assert.match(wiki, /density="compact"/);
  assert.match(tools, /density="compact"/);
  for (const relativePath of [
    "src/pages/case-studies/index.astro",
    "src/pages/resources/index.astro",
  ]) {
    const hub = fs.readFileSync(path.join(repoRoot, relativePath), "utf-8");
    assert.match(hub, /density="compact"/, `${relativePath} avoids placeholder feature height`);
  }
  assert.ok(css.indexOf(".case-card--compact {") > css.indexOf(".case-card {"), "compact density wins the cascade");
  assert.match(css, /\.case-grid li:only-child \.case-card:not\(\.case-card--compact\)/);
  assert.doesNotMatch(wiki, /page-shell--wiki/);
  assert.doesNotMatch(css, /\.page-shell--wiki/);
  assert.match(css, /\.page-header--wide-title h1\s*\{[^}]*max-width:\s*none/s);
  assert.match(css, /\.case-card--compact\s*\{[^}]*min-height:\s*0/s);
});

test("collection hubs use the Brand Lab card structure", () => {
  for (const route of ["/case-studies/", "/resources/"]) {
    const html = readRoute(route);
    assert.match(html, /<li>\s*<article class="case-card case-card--compact">/);
    assert.doesNotMatch(html, /<li class="case-card">/);
  }
});

test("the Brand Lab owns the shared workflow and closing CTA patterns", () => {
  const lab = fs.readFileSync(
    path.join(repoRoot, "src", "components", "brand", "BrandSystemLab.astro"),
    "utf-8",
  );
  assert.match(lab, /data-pattern="page-header"/);
  assert.match(lab, /<PageHeader/);
  assert.match(lab, /data-pattern="commercial-hero"/);
  assert.match(lab, /<CommercialHero/);
  assert.match(lab, /data-pattern="entry-header"/);
  assert.match(lab, /<EntryHeader/);
  assert.match(lab, /data-pattern="loop-field"/);
  assert.match(lab, /<LoopField/);
  assert.match(lab, /data-pattern="workflow-rail"/);
  assert.match(lab, /<WorkflowRail/);
  assert.match(lab, /data-pattern="case-card"/);
  assert.match(lab, /<CollectionCard/);
  assert.match(lab, /data-pattern="cta-panel"/);
  assert.match(lab, /<CtaPanel/);
  assert.match(lab, /data-pattern="page-cta"/);
  assert.match(lab, /<PageCta/);
});

test("the skip link remains readable before and during focus", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(
    css,
    /\.skip-link\s*\{[^}]*background:\s*var\(--surface-dark\)[^}]*color:\s*var\(--text-inverse\)/s,
  );
});

test("the workflow rail is a static ordered sequence, not fake live progress", () => {
  const component = fs.readFileSync(
    path.join(repoRoot, "src", "components", "WorkflowRail.astro"),
    "utf-8",
  );
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.doesNotMatch(component, /Live path|data-page-motion|workflow-rail__progress/);
  assert.doesNotMatch(css, /\.workflow-rail__progress/);
  assert.match(component, /<ol class="workflow-rail__steps">/);
  assert.match(css, /\.workflow-rail\s*\{[^}]*margin:\s*var\(--rhythm-block\) 0/s);
  assert.match(css, /\.workflow-rail > \.eyebrow\s*\{[^}]*margin-block-end:\s*var\(--space-3\)/s);
});

test("page motion progressively enhances scrolling and interaction", () => {
  const header = fs.readFileSync(
    path.join(repoRoot, "src", "components", "SiteHeader.astro"),
    "utf-8",
  );
  const component = fs.readFileSync(
    path.join(repoRoot, "src", "components", "MotionEnhancement.astro"),
    "utf-8",
  );
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(header, /import MotionEnhancement/);
  assert.match(header, /<MotionEnhancement/);
  assert.doesNotMatch(header, /<script/);
  assert.match(component, /data-nav-enhancement/);
  assert.match(component, /IntersectionObserver/);
  assert.match(component, /prefers-reduced-motion:\s*reduce/);
  assert.match(component, /data-motion-ready/);
  assert.match(component, /DOMContentLoaded/);
  assert.match(component, /enhancePage/);
  assert.match(css, /--motion-enter:\s*200ms/);
  assert.match(css, /--motion-enter-ease:\s*cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  assert.match(css, /html\[data-motion-ready\][^}]*data-reveal="pending"[^}]*opacity:/s);
  assert.match(css, /\.case-card\s*\{[^}]*transition:[^}]*transform/s);
});

test("the case studies use genuinely different animated diagrams", () => {
  const site = readRoute("/case-studies/this-site/");
  const release = site.match(
    /<figure class="case-diagram case-diagram--release">([\s\S]*?)<\/figure>/i,
  )?.[0];
  assert.ok(release, "the website case renders its release architecture");
  assert.match(release, /class="release-map__sources"/);
  assert.equal((release.match(/<li(?:\s|>)/g) ?? []).length, 3);
  for (const label of ["Routes", "Content", "Evidence", "Verify", "Static release"]) {
    assert.match(release, new RegExp(`<strong>${label}<\/strong>`));
  }
  assert.match(release, /class="release-map__packet" aria-hidden="true"/);
  assert.match(release, /One route list and one proof gate produce one checked release\./);
  assert.doesNotMatch(release, /source-loop/);
  assert.doesNotMatch(site, /<figure class="process-diagram">/);

  const bot = readRoute("/case-studies/mastra-resume-bot/");
  const sourceLoop = bot.match(
    /<figure class="case-diagram case-diagram--source-loop">([\s\S]*?)<\/figure>/i,
  )?.[0];
  assert.ok(sourceLoop, "the résumé bot case renders its source-answer loop");
  // Steps 01-03 are the strip; step 04 is the landing that holds the document,
  // so only three list items carry the shared-edge sequence.
  assert.match(sourceLoop, /class="source-loop__path"/);
  assert.equal((sourceLoop.match(/<li(?:\s|>)/g) ?? []).length, 3);
  for (const label of ["Question", "Retrieve", "Bounded answer", "Citation"]) {
    assert.match(sourceLoop, new RegExp(`<strong>${label}<\/strong>`));
  }
  assert.match(sourceLoop, /class="source-loop__fallback"/);
  assert.match(sourceLoop, /Cannot verify/);
  assert.match(sourceLoop, /class="source-loop__signal" aria-hidden="true"/);
  assert.match(sourceLoop, /A checked answer returns to the résumé passage that supports it\./);
  assert.doesNotMatch(sourceLoop, /release-map/);
  assert.doesNotMatch(bot, /<figure class="process-diagram">/);

  // The fork is the explanation: one branch lands on the cited sheet, the other
  // on an empty frame. The document is decorative SVG, so its meaning has to
  // survive in text beside it.
  assert.match(sourceLoop, /class="source-loop__branch">Source found</);
  assert.match(sourceLoop, /source-loop__branch--none">No source</);
  assert.match(sourceLoop, /class="source-loop__empty">No page\. No quote\. No crop\./);
  assert.match(sourceLoop, /<svg class="source-sheets"[^>]*aria-hidden="true"/);
  assert.equal((sourceLoop.match(/class="source-sheets__page"/g) ?? []).length, 2);
  assert.equal((sourceLoop.match(/source-sheets__page--cited"/g) ?? []).length, 1);
  assert.equal((sourceLoop.match(/class="source-sheets__band"/g) ?? []).length, 1);
  assert.match(sourceLoop, /Page 3 of 3/);
  assert.match(sourceLoop, /source-loop__meta-cited">Quoted passage</);

  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.match(css, /@keyframes release-packet-travel/);
  assert.match(css, /@keyframes source-loop-travel/);
  assert.match(
    css,
    /\.case-diagram--source-loop figcaption\s*\{[^}]*color:\s*var\(--text-inverse\)/s,
  );
  // Both fork connectors are one row-gap tall, which is what keeps them landing
  // on the strip's border instead of floating in the gap.
  const forkGap = css.match(/\.source-loop\s*\{[^}]*row-gap:\s*var\((--space-\d)\)/s);
  assert.ok(forkGap, "the source loop declares its fork gap");
  assert.match(
    css,
    new RegExp(
      `\\.source-loop__landing::before,\\s*\\.source-loop__fallback::before\\s*\\{[^}]*inset-block-end:\\s*100%[^}]*height:\\s*var\\(${forkGap[1]}\\)`,
      "s",
    ),
  );
  // The charcoal figure's hairline is a token now, not a repeated literal.
  assert.doesNotMatch(css, /rgba\(247, 242, 225, 0\.42\)/);
  const reduced = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(reduced);
  assert.match(reduced[1], /\.release-map__packet/);
  assert.match(reduced[1], /\.source-loop__signal/);
});

test("entry pages use the full editorial width and concise case-study naming", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  const caseStudy = fs.readFileSync(
    path.join(repoRoot, "src", "content", "case-studies", "this-site.md"),
    "utf-8",
  );
  assert.match(caseStudy, /^title: "Building This Website"$/m);
  assert.doesNotMatch(caseStudy, /Transparent Self Project/);
  assert.match(css, /\.case-study-shell\s*\{[^}]*width:\s*100%/s);
  assert.match(css, /\.case-study-header\s*\{[^}]*grid-template-columns:/s);
});

test("the self-project case study tells a challenge-to-result story without invented proof", () => {
  const caseStudy = fs.readFileSync(
    path.join(repoRoot, "src", "content", "case-studies", "this-site.md"),
    "utf-8",
  );
  for (const heading of [
    "The starting point",
    "What had to be true",
    "What I built",
    "What changed during the build",
    "The result",
    "What remains unfinished",
  ]) {
    assert.match(caseStudy, new RegExp("^## " + heading + "$", "m"));
  }
  assert.match(caseStudy, /self-project, not a client success story/i);
  assert.match(caseStudy, /no invented metrics/i);
  assert.match(caseStudy, /same checked files/i);
  assert.match(caseStudy, /Contact page puts both ways to start in the first screen/i);
});

test("the résumé bot case study is a checked build story with explicit limits", () => {
  const caseStudy = fs.readFileSync(
    path.join(repoRoot, "src", "content", "case-studies", "mastra-resume-bot.md"),
    "utf-8",
  );
  for (const heading of [
    "The problem",
    "What had to be true",
    "What I built",
    "What changed during the build",
    "The result",
    "What remains limited",
  ]) {
    assert.match(caseStudy, new RegExp("^## " + heading + "$", "m"));
  }
  assert.match(caseStudy, /^title: "A Résumé Bot That Shows Its Source"$/m);
  assert.match(caseStudy, /sourceId: source-mastra-resume-bot-live-001/);
  assert.match(caseStudy, /does not prove every possible answer is correct/i);
  assert.match(
    caseStudy,
    /does not\s+show a hiring result, time saved, or a change in recruiter behavior/i,
  );

  const sources = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "src", "data", "sources.json"), "utf-8"),
  );
  assert.equal(
    sources["source-mastra-resume-bot-live-001"]?.publicUrl,
    "https://resume.ryanjosebrosas.dev/",
  );

  const siteCaseStudy = fs.readFileSync(
    path.join(repoRoot, "src", "content", "case-studies", "this-site.md"),
    "utf-8",
  );
  assert.doesNotMatch(siteCaseStudy, /résumé assistant is still a later service/i);
});

test("the built résumé bot case study is public, evidenced, and discoverable", () => {
  const route = "/case-studies/mastra-resume-bot/";
  const html = readRoute(route);
  assert.match(html, /<h1[^>]*>\s*A Résumé Bot That Shows Its Source\s*<\/h1>/);
  assert.match(html, /<meta name="robots" content="index,follow">/);
  assert.ok(html.includes('href="https://resume.ryanjosebrosas.dev/"'));
  assert.match(html, /Live Mastra résumé bot deployment/);

  const hub = readRoute("/case-studies/");
  assert.match(hub, /href="\/case-studies\/mastra-resume-bot\/"/);
  assert.match(hub, /A Résumé Bot That Shows Its Source/);

  const sitemap = fs.readFileSync(path.join(repoRoot, "dist", "sitemap.xml"), "utf-8");
  assert.match(sitemap, /\/case-studies\/mastra-resume-bot\//);
});

test("display headings use a readable shared measure without empty grid tracks", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  assert.doesNotMatch(
    css,
    /\.page-shell--services \.prose h2[^{]*\{[^}]*grid-template-columns/s,
    "services prose heading carries no grid declaration (base or responsive)",
  );
  assert.match(css, /--measure-heading:\s*18ch/);
  assert.match(css, /\.section-heading h2 \{[^}]*max-width:\s*var\(--measure-heading\)/s);
  assert.match(css, /\.cta-panel h2 \{[^}]*max-width:\s*var\(--measure-heading\)/s);
  assert.match(css, /\.page-header h1 \{[^}]*max-width:\s*var\(--measure-heading\)/s);
  assert.doesNotMatch(
    css,
    /\.page-header--wide-title h1\s*\{[^}]*(?:font-size|line-height)/s,
    "the wide-title variant changes measure without changing the shared H1 scale",
  );
});

test("the 404 recovery actions use the shared button spacing", () => {
  const page = fs.readFileSync(path.join(repoRoot, "src", "pages", "404.astro"), "utf-8");
  assert.match(
    page,
    /<div class="button-row">[\s\S]*?Return to the home page[\s\S]*?Browse resources[\s\S]*?<\/div>/,
  );
});

test("commercial route modifiers target structures that current content actually renders", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  const about = fs.readFileSync(path.join(repoRoot, "src", "content", "pages", "about.md"), "utf-8");
  const contact = fs.readFileSync(path.join(repoRoot, "src", "content", "pages", "contact.md"), "utf-8");
  const services = fs.readFileSync(path.join(repoRoot, "src", "content", "pages", "services.md"), "utf-8");

  assert.doesNotMatch(about, /^[-*] |^\d+\. /m);
  assert.doesNotMatch(css, /\.page-shell--about \.prose (?:ul|li)/);
  assert.match(contact, /^1\. /m);
  assert.match(css, /\.page-shell--contact \.prose ol/);
  // About and Services share the long-form section-rule treatment, so both have
  // to actually render the h2 the shared selector styles.
  assert.match(services, /^## /m);
  assert.match(about, /^## /m);
  assert.match(css, /:is\(\.page-shell--about, \.page-shell--services\) \.prose h2/);
});

test("page patterns contain no stale wrappers or unused selector contracts", () => {
  const css = fs.readFileSync(path.join(repoRoot, "src", "styles", "global.css"), "utf-8");
  const page = fs.readFileSync(path.join(repoRoot, "src", "pages", "[page].astro"), "utf-8");
  const cta = fs.readFileSync(path.join(repoRoot, "src", "components", "PageCta.astro"), "utf-8");
  assert.doesNotMatch(css, /\.hero__kicker|\.hero__visual\s*>\s*svg|\.contact-actions|\.commercial-body|Method grid/);
  assert.doesNotMatch(page, /commercial-body/);
  assert.doesNotMatch(cta, /secondaryRel/);
});

test("the About page is reader-focused without repeating the site owner's name", () => {
  const about = fs.readFileSync(
    path.join(repoRoot, "src", "content", "pages", "about.md"),
    "utf-8",
  );
  assert.match(about, /^title: "About"$/m);
  assert.doesNotMatch(about, /Ryan(?: Brosas)?/i);
  const sectionCount = [...about.matchAll(/^## /gm)].length;
  assert.ok(sectionCount >= 2 && sectionCount <= 3);
  assert.match(about, /recurring work/i);
  assert.match(about, /Philippines/);
  assert.match(about, /published case study/i);
  assert.match(about, /see how the work moves/i);
});

test("Work With Me stays reader-first and closes with a usable next step", () => {
  const services = readRoute("/services/");
  const proseStart = services.indexOf('class="prose"');
  const fit = services.indexOf("The same task eats your attention every week");
  const scope = services.indexOf("The scope stays small");
  const handoff = services.indexOf("Done means your team can run it");
  const cta = services.indexOf('id="services-next-step"');
  assert.ok([proseStart, fit, scope, handoff, cta].every((position) => position >= 0));
  assert.deepEqual(
    [proseStart, fit, scope, handoff, cta],
    [proseStart, fit, scope, handoff, cta].toSorted((a, b) => a - b),
  );
  assert.match(services.slice(cta), /href="\/contact\/"[^>]*>Start with one task<\/a>/);
  assert.match(services.slice(cta), /href="\/case-studies\/"[^>]*>\s*See a real build\s*<\/a>/);
});
