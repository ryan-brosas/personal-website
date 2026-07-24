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

## [2026-07-25T04:40:00Z] Task: T3 — env-driven SITE_ORIGIN with prod placeholder guard

- **Vite sets NODE_ENV=production internally** before evaluating `astro.config.mjs` during ANY
  `astro build` invocation — including test-invoked builds via `spawnSync`. This makes `NODE_ENV`
  unreliable as a discriminator for "real production build" vs "test build". Both `astro check`
  and test-invoked `astro build` see `NODE_ENV=production` inside the config file.
- **Guard design**: throw only when `SITE_ORIGIN` is explicitly set to the placeholder value
  (`https://example.com`). This catches the operator mistake of copying the placeholder into
  CI/CD env vars. Absent `SITE_ORIGIN` falls back silently — the normal dev/test state.
- **`declare const process`**: `@types/node` is not installed; added a minimal ambient declaration
  in `src/lib/route-registry.ts` so TypeScript accepts `process.env["SITE_ORIGIN"]` without
  requiring the package. The declaration is type-only, zero runtime cost.
- **`canonicalFor` signature**: made `origin` optional (`origin?: string`) in both the interface
  and implementation. Explicit `origin` arg (used by existing tests) takes precedence; env var
  is the production path; placeholder is the dev/test fallback. Tests pass unchanged.
- **Full gate**: `npm run check` (0 errors) + `npm test` (142/142) + `npm run build` (5 pages)
  + `npm run verify` (ok) + `SITE_ORIGIN=https://ryanjosebrosas.dev npm run build` (5 pages) all green.
