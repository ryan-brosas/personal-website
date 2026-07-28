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
quote, no conversion claim, and no invented metrics. This study shows how I turned an
unclear site plan into a clear, checked build process. It also shows what the
repo can prove and what is still unknown.

## The starting point

I needed a portfolio I could show before I added the résumé assistant. I also
had work that I could not share without consent.

The first site had pages and ideas. Yet a polished page was not enough. A
founder or operator should be able to trust the way the site works. Routes
should not drift. Draft work should not leak into search. Each public claim
should link back to proof.

I did not need a full tool for web publishing. I needed a sound static site. It
also had to make room for checked work later.

## What had to be true

I set five rules for the build.

- **The full page must work without JavaScript.** The menu, text, site search
  paths, and main next step must still work.
- **Routes need one owner.** A route is a page path. Its path, main web address,
  menu link, and parent link should come from one source.
- **Publishing must fail closed.** If a page has no clear public state, the site
  must keep it private.
- **Public claims need safe proof.** Draft copy may state what I plan to offer.
  A fact must point to proof that is safe to share.
- **The final files must pass checks.** A clean Astro build is not enough when
  the files break a publish rule.

These rules kept the site static. The work did not show a need for a live
server, a content system, or a web app that runs the page in the browser.

## What I built

### One route registry

One route list owns each public path. It also owns the ending slash, menu order,
parent link, and rules for pages made from a set of content.

Pages use this list instead of making their own links. The same list sets page
trails, planned build files, and which pages search tools may find. A route
change starts in one known place.

### A fail-closed publishing flow

Each item has one of three states.

- `draft` makes no page.
- `noindex` makes a page that people can visit, but leaves it out of site search
  lists.
- `public` may place the page in the menu and site map.

A group page stays out of those lists until it has a public child page. This
keeps an empty part of the site from looking done.

### Proof before a page goes public

The home page does not go public just because its file exists. A proof gate
checks this case study, the list of proof sources, and the approved claims about
this project. If one link in that chain fails, the home page falls back to
`noindex`.

This rule is more strict than the current copy needs. It gives later studies a
safe place for numbers, quotes, and consent notes. Those checks stay in one
place instead of being spread through the site.

### A clear page with small add-ons

Astro makes plain HTML with named page parts and plain CSS. This gives the page
a sound base before scripts run.

One small script runs the mobile menu and scroll effects. The browser tool
`IntersectionObserver` tells the script when an item comes into view. If the
script or that tool does not work, the text stays in view and the menu still
works. The page also stays still when a person asks for less motion.

### Checks on the final site

The build check reads the final files. It does not trust the source code alone.
It checks planned routes, main web addresses, the site map, rules for search
bots, and files that should not exist.

Browser checks cover the keyboard, screen sizes, and low-motion settings. They
also look for script errors and failed file requests.

## What changed during the build

The core plan held up, but parts of the design did not.

The home page had a stronger look than the first inner pages. I did not copy its
code into each page. I moved shared title, card, work step, and closing link
parts into shared site parts and the local Brand Lab.

The first scroll effect used a CSS view timeline. It worked in the test browser
but failed in the browser used for the demo. I changed it to
`IntersectionObserver` in the same small script. The page still showed all text
without JavaScript. I also matched the timing to the brand motion rules.

The first study page was too narrow on a wide screen. It left a large blank
space. The new page gives the title and short summary more room. The body text
stays at an easy line width. I also cut the long title down to **Building This
Website**.

These fixes came from use in a real browser. A source check alone would not have
found all of them.

## The result

The site now makes static pages from shared rules. Those rules set the menu,
main web addresses, page trails, search files, page data for search tools, and
publish state.

Draft work makes no route. Public claims about this project point to the listed
source. The build check reads the final files before they count as a release.

This does not prove more traffic or sales. It proves that I can show and test the
steps used to publish the site. A founder or operator can see where key choices
live, how checks fail, and which claims have proof.

## What remains unfinished

Most proof for the rest of the portfolio still needs to be added. There are no
client result claims, approved client quotes, or made-up case study numbers to
fill the gaps.

The résumé assistant is still a future service. It stays apart from the static
Astro site until its web request rules are ready.

The gaps stay in view on purpose. The next step is to add one more piece of work
with a clear claim, source, and consent trail. More pages can wait.
