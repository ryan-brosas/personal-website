# M2 Content and Route Contracts (Child 1 of Plan 03)

**Slug:** m2-content-route-contracts
**Created:** 2026-07-22
**Status:** In Progress (artifact created; ready for `/ship`)
**Parent:** `m2-accessible-core-shell` (aggregate)
**Master plan ref:** `.opencode/artifacts/website-build/plan.md:309-331`

## Slug Metadata

```yaml
depends_on: ["m1-proven-static-foundation"]
parallel: false
conflicts_with: []
blocks: ["m2-semantic-shell"]
estimated_hours: 4
```

---

## Problem Statement

M1 proved the policy kernel but `ROUTES` is empty, `PageSchema` and `SettingsDataSchema`
do not exist, and the verifier expects zero HTML routes. Before the semantic shell can
render any page, this child establishes the content/route contracts that all later M2
children consume: page/settings schemas, a single visibility-driven route pipeline, and
a phase-aware verifier.

---

## Scope

**In scope:**
1. Content schemas: `PageSchema` (frontmatter-only, extends `RecordBase` with `title`,
   `description`), `SettingsDataSchema` (nav labels, site title, optional contact block).
2. Settings file envelope: `{"site": <SettingsData>}` loaded via `file()` loader;
   entry ID `site`; schema validates inner `SettingsData` only.
3. Page loader narrowed to `.md` only (remove MDX from `pages` collection).
4. Route-visibility pipeline: a single resolver (`site-routes.ts`) consumed by
   `getStaticPaths()`, navigation, sitemap, and verifier. `draft`->no route,
   `noindex`->route+no discovery, `public`->route+discovery.
5. `src/config/site.ts`: code-controlled page IDs, route paths, navigation order.
6. Phase-aware verifier: parameterized manifest with `expectedHtmlRoutes`,
   `expectedDiscoverableRoutes`, `expectedFileEndpoints`, `allowEmptySitemap`,
   and a narrow `_astro/` asset allowlist.

**Non-goals:**
- No production HTML pages (Child 2 owns the shell).
- No brand tokens or CSS.
- No Contact-specific security validation (Contact child).
- No Markdown body safety guard (core-pages child).
- No browser accessibility (accessibility child).

---

## Success Criteria

1. **Schemas validate:** `PageSchema` and `SettingsDataSchema` accept valid records
   and reject invalid ones at build time. Verify: `npm run check && npm test`.
2. **Route pipeline is visibility-driven:** one resolver drives `getStaticPaths`,
   sitemap, and verifier expectations. `draft`->no route, `noindex`->route excluded
   from discovery, `public`->route in sitemap. Verify: `npm test`.
3. **Verifier is phase-aware:** parameterized manifest accepts the M1 root build
   (empty routes) and any future phase's expected routes/endpoints. Read-only.
   Verify: `npm run verify` exits 0 on the current (empty-route) build.

---

## Open Questions

None -- this child is fully unblocked by M1.

---

## Related Tracks

- **Parent:** `m2-accessible-core-shell` (aggregate-close after all children)
- **Next child:** `m2-semantic-shell` (depends on this child's route pipeline)
