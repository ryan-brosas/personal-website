---
title: "Building This Website: A Transparent Self-Project"
description: "How this site is built: a static Astro app with one route list, strict publish rules, and a build check that must pass."
visibility: public
owner: ryan
kind: case-study
slug: this-site
pillar: ai-workflow-systems
evidence:
  kind: verified
  sourceId: source-self-project-build-001
---

This case study covers how this website is built. Every point below is a fact you
can check in the site's own source and output. There are no client results,
numbers, or quotes.

## Stack

The site is a static [Astro](https://astro.build) application. It renders
semantic HTML with plain CSS and ships no UI framework and no client-side
navigation script beyond a single progressive nav enhancement. TypeScript runs
in strict mode, and the content layer is Markdown-first through Astro Content
Collections.

## Architecture decisions

- **One route registry as the single source of truth.** Every route path,
  canonical URL, navigation entry, and parent link derives from one registry
  module; no page hard-codes a route or canonical string.
- **Fail-closed visibility.** Content defaults to `draft` (no route). A page is
  only published when it explicitly declares `public`, and `noindex` pages stay
  crawlable while being excluded from discovery outputs.
- **Evidence-gated public claims.** Any approved public claim must reference a
  source in a public-safe registry; this very entry cites the committed static
  build and its public source repository as its evidence.
- **A deterministic build verifier.** A read-only script checks the generated
  output against the registry: expected routes carry self-canonicals, the
  sitemap advertises only verified public URLs, and no draft or `noindex` route
  leaks into discovery.

## Timeline

The build proceeds in reviewed slices: an accessible static shell first, then
the route registry and canonical pipeline, the content and evidence models, the
structured-data and authority layer, and finally the public case-study and
service pages. Each one lands only after its check passes.
