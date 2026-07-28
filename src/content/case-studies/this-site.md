---
title: "Building This Website"
description: "How a placeholder portfolio became a static Astro site with one route source, fail-closed publishing, and a build verifier."
visibility: public
owner: ryan
kind: case-study
slug: this-site
pillar: ai-workflow-systems
evidence:
  kind: verified
  sourceId: source-self-project-build-001
---

This is a self-project, not a client success story. There is no borrowed
testimonial, no conversion claim, and no invented metrics. The useful story is
simpler: what was unclear at the start, what I chose to build, what changed when
those choices met a real browser, and what the repository can prove now.

## The starting point

I needed a portfolio core that I could actually show before adding the résumé
assistant or publishing work that still needs permission. The first version had
pages and ideas, but the harder problem was trust. A polished page would not be
credible if its routes drifted, draft content leaked into discovery, or a public
claim could not be traced to evidence.

That made the job larger than styling a homepage and smaller than building a
full publishing platform. The immediate goal was a dependable static site with
a clear path for adding verified work later.

## What had to be true

I set five constraints before treating the site as ready:

- **The complete page must work without JavaScript.** Navigation, content,
  discovery, and the primary next step cannot depend on hydration.
- **Routes need one owner.** Paths, canonical URLs, navigation entries, and
  parent links should not be retyped across pages.
- **Publishing must fail closed.** A missing visibility decision should keep
  content private rather than accidentally exposing it.
- **Public claims need public-safe evidence.** Placeholder copy can describe the
  intended service, but factual claims must resolve to something inspectable.
- **The release output must be testable.** A successful framework build is not
  enough if the generated files contradict the publishing rules.

These constraints kept the project static. There was no demonstrated need for a
server adapter, a CMS runtime, or a client application controlling the page.

## What I built

### One route registry

The route registry owns every public path, trailing-slash rule, navigation
position, parent relationship, and dynamic collection pattern. Pages consume
those decisions instead of assembling URLs locally. The same registry feeds
breadcrumbs, expected build output, and discovery policy, so changing a route
has one deliberate starting point.

### A fail-closed publishing pipeline

Content moves through three explicit states. `draft` creates no route. `noindex`
can be visited but stays out of discovery. `public` can appear in navigation and
the sitemap. Collection hubs only become discoverable when they have a public
child, which prevents empty sections from looking finished.

### Evidence before promotion

The homepage does not become publicly discoverable just because its template
exists. Its promotion gate checks this case study, the evidence source registry,
and the approved self-project claims. If that chain stops resolving, the home
route falls back to `noindex`.

That is intentionally stricter than the current copy requires. It gives later
case studies somewhere safe to put metrics, testimonials, and source
permissions without turning editorial judgment into scattered conditionals.

### A semantic shell with bounded enhancement

Astro renders static HTML with semantic landmarks and plain CSS. One inline
progressive-enhancement seam handles mobile navigation and optional scroll
reveals. If that script or `IntersectionObserver` is unavailable, the content
stays visible and the navigation stays usable. Reduced-motion preferences keep
the page static.

### Verification of the generated site

The build verifier reads the final output rather than trusting source intent. It
checks expected routes, canonical URLs, sitemap membership, robots policy, and
unexpected generated files. Browser checks then cover keyboard navigation,
console errors, failed requests, responsive layouts, and reduced-motion states.

## What changed during the build

The architecture held, but several presentation decisions did not survive first
contact with the actual site.

The homepage established a stronger editorial system than the early inner
pages. Instead of copying that markup page by page, I moved the reusable heading,
card, workflow, and closing-action patterns into shared production components
and the local Brand Lab.

Motion exposed a compatibility problem. A CSS view-timeline reveal worked in the
verification browser but not in the browser used to review the demo. I replaced
it with an `IntersectionObserver` enhancement inside the existing single script,
kept the no-JavaScript baseline visible, and aligned the entry timing with the
brand motion rules.

The first entry layout also stopped at a narrow shell and left a large unused
column on desktop. The final version uses the full editorial width for the title
and summary while preserving a readable measure for the article body. The title
was shortened from an explanatory suffix to the direct **Building This
Website**.

Those corrections matter because they show the difference between a design that
passes a source-level check and one that works in the review context.

## The result

The current site produces static pages whose navigation, canonicals,
breadcrumbs, discovery files, structured data, and publishing state derive from
shared policy. Draft content stays unrouted. Public self-project claims resolve
to the registered source. The generated build is checked before it is treated as
a release.

The outcome is not a promised traffic or conversion result. It is a portfolio
foundation I can inspect, demonstrate, and extend without weakening the rules
that made the first version credible.

## What remains unfinished

Most portfolio evidence still needs to be added. There are no client outcome
claims, approved testimonials, or fabricated case-study numbers filling those
gaps. The résumé assistant remains a separate future service rather than being
mixed into the static Astro application before its HTTP contract is ready.

That incompleteness is visible on purpose. The next useful step is not adding
more surface area; it is publishing the next piece of work with the same clear
claim, source, and permission trail.
