# Learnings — seo-geo-authority-refactor

Conventions, patterns, and successful approaches discovered during work on this plan.

_Auto-scaffolded by /start-work. Append new entries below - never overwrite._

---

## [2026-07-25] Task: T2 — ROUTE_REGISTRY as single route source

- **Test runner reality:** `npm test` = `node --test` running `*.test.mjs`, which import `.ts`
  directly via Node's native type-stripping. tsconfig sets `erasableSyntaxOnly` (NO enums/
  namespaces — use string-literal unions) and `verbatimModuleSyntax` (type-only imports MUST
  use `import type`). New kernel files followed both.
- **Registry API shape:** `defineRoutes(defs)` validates at construction (fail-fast) and returns
  a `RouteRegistry` object with METHODS (`ROUTE_REGISTRY.navItems()` etc.) — this matches the
  PAGES-shim call form in the plan. `validateRegistry` is a separate standalone export so unit
  tests can hit edge cases directly.
- **Layering that avoids a cycle:** `lib/routes.ts` (canonical primitives) ← `lib/route-registry.ts`
  ← `config/routes.ts` (ROUTE_REGISTRY). `routes.ts` must NOT import the registry, so
  `ROOT_ROUTE_POLICY` was moved OUT of `routes.ts` and is re-derived in `config/routes.ts` via
  `ROUTE_REGISTRY.byId("home")`. Consumers (index.astro, sitemap.xml.ts) just swapped the import
  source — one line each, no logic change.
- **Nav-order preservation:** existing NAV_ORDER was `[about, services, contact]`. Encoded as
  registry `navOrder` about=10/services=20/contact=30 so `navItems()` reproduces the shipped
  visual order (the design doc's services-first ordering would have broken the a11y/shell snapshot).
- **navLabelKey stays narrow:** `SettingsData.navLabels` has exactly about/services/contact keys,
  so `NavLabelKey` must remain that union. `case-studies` is registered (id reserved, hub gate
  declared) but carries NO navLabelKey and `navPlacement:"none"` — it is not navigable until T14
  adds the settings key + NAV_ORDER slot. This keeps `navItems()`/PAGES type-safe.
- **resolveRoutes stayed behavior-identical** by iterating `ROUTE_REGISTRY.navItems()` instead of
  PAGES; site-routes.ts no longer imports config/site (fewer PAGES consumers, same output).
