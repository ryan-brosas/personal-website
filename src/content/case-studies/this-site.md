---
title: "Building This Website"
description: "How a rough portfolio became a clear site with shared rules, build checks, and a safe deploy."
visibility: public
owner: ryan
kind: case-study
slug: this-site
pillar: ai-workflow-systems
evidence:
  kind: verified
  sourceId: source-self-project-build-001
diagram:
  caption: "One route list, one proof gate, one checked release."
  stages:
    - label: "Register"
      detail: "One list owns each public path."
    - label: "Write"
      detail: "Checked content holds its public state and proof."
    - label: "Check"
      detail: "Build tests check links, page data, and files."
    - label: "Release"
      detail: "One checked static build ships in one step."
---

This is a self-project, not a client success story. There are no invented metrics,
borrowed quotes, or sales claims. The live site and public code are the proof.
They show what I built, how I checked it, and what is still unknown.

## The starting point

I needed a portfolio I could show before I added a résumé assistant. Some past
work could not be shared without consent. The site had to earn trust through its
own work first.

The early build had pages, rules, and good ideas. The home page set a clear
standard. The rest did not yet feel like the same product. Some pages were too
plain. Useful links were hard to scan. The Contact page asked people to act, but
put the real actions near the end.

There was a second risk under the design. A page could look done while its route,
claim, or deploy step still lived in my memory. That would make each change
slower and less safe.

I did not need a large web app. I needed a clear static site with rules that
could hold up as the content grew.

## What had to be true

I set five rules for the work.

- **The full site must work without JavaScript.** People must still read every
  page, use the menu, browse the resources, and reach the main action.
- **Routes need one owner.** The path, menu link, main web address, and parent
  link must come from one source.
- **Public claims need proof.** A fact must point to a source that is safe to
  share. Draft work must not leak into public lists.
- **Shared patterns stay shared.** A fix to a button, page title, card, or next
  step should reach every place that uses it.
- **Only checked files go live.** The release must use the same output that
  passed the build and policy checks.

These rules kept the site small. They also gave each later design choice a clear
place to live.

## What I built

### A publishing core

One route list owns the public paths. It also sets the menu order, ending slash,
parent links, page trails, and the files expected after a build.

Each content item has one of three states.

- `draft` makes no page.
- `noindex` makes a page that people can visit, but keeps it out of public lists.
- `public` may place the page in the site map and other public lists.

A group page stays out of those lists until it has a public child. This keeps an
empty area from looking complete.

The home page also has a proof gate. It becomes public only when this case study,
its source, and the approved home claim all resolve. If one part fails, the home
page falls back to `noindex`.

### A shared visual system

Astro builds plain HTML. Plain CSS holds the type, color, space, layout, and
motion rules. Shared components own repeated page parts such as headings,
cards, work steps, proof notes, and calls to action.

A local Brand Lab shows those parts together. It is not part of the public site.
It gives me one place to inspect a shared change before it reaches many pages.

The main content and menu work before scripts run. One small browser script adds
the mobile menu, list filters, and scroll motion. If that script fails, the full
content stays on the page. Motion also stops when a person asks for less motion.

### Resources that help before a call

The Resources area became more than a row of links. It now has a plain-language
wiki, a tool directory, short guides, and checklists.

The full lists are in the HTML. A small filter helps people scan them when
JavaScript works. Without it, every entry is still there.

This gives a reader a useful next step before asking for a call. It also shows
how the site can grow without adding a new route system for each content type.

### A direct way to start

The Contact page puts both ways to start in the first screen. A person can book a
call or use email. The page then asks for one repeated task, how it works now,
and where it breaks.

Both links come from checked site settings. The same action component also owns
button markup in other page sections and in the Brand Lab.

### A checked release path

The build check reads the final site files. It checks routes, main web addresses,
the site map, search rules, and files that should not exist.

CI checks the source, builds the production site, runs the tests, and checks the
final output. It saves that output only after all steps pass.

The deploy job sends those same checked files to a folder named for the commit.
It then switches the live `current` link in one move. Caddy serves that release
with compressed files, security headers, and a controlled not-found page.

## What changed during the build

The core rules held up. Several first design choices did not.

The first inner pages did not match the home page. I did not copy the home code
into each route. I moved the useful parts into shared components, then gave each
page its own clear job.

The first resource layouts used too much card-like space. The wiki and directory
became denser lists. This made more links easy to scan while keeping each entry
clear.

The first Contact hero was a dark tile that repeated the prompt. The real links
came much later. I replaced the tile with the booking and email actions. I also
removed the repeated opening and closing copy.

The first scroll effect used a CSS view timeline. It passed in one browser but
failed in the demo browser. I moved the effect to `IntersectionObserver` in the
existing small script. The no-script view stayed complete.

The first warm paper color looked too yellow across full pages. I kept a small
amount of warmth but moved the canvas close to white. Contrast checks guard the
new paper tones.

Each of these changes came from looking at the real page on wide and narrow
screens. Source checks alone would not have found them.

## The result

The site is now a complete first public version. It has a clear home page,
service path, About page, case study, resource library, and direct Contact path.
The parts look and act like one product.

The publishing rules set routes, public lists, page trails, search files, page
data, and claim proof. Shared components keep repeated design fixes in one
place.

Every push to `main` must pass the production build, tests, and final-file check
before deploy can start. The same checked files become the live release. The
public source shows each part of that path.

This does not prove more traffic, leads, or sales. It does not predict the result
of another project. It proves that I can turn a rough plan into a working site,
find weak parts through use, and leave a clear way to test and ship the next
change.

## What remains unfinished

The rest of the portfolio still needs more public proof. There are no client
result claims, approved client quotes, or made-up case study numbers filling the
gaps.

The résumé bot now runs as a separate live service. The portfolio links to it,
but model work and credentials still stay outside the static Astro build.

This version is a base, not an end state. The next useful step is another piece
of work with a clear claim, source, and consent trail.
