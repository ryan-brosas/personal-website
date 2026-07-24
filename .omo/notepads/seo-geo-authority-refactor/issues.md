# Issues — seo-geo-authority-refactor

Problems and gotchas encountered during work on this plan.

_Auto-scaffolded by /start-work. Append new entries below - never overwrite._

---

## [2026-07-25] Task: T2 — ROUTE_REGISTRY as single route source

- **GOTCHA (validation):** `isFileEndpoint("/sitemap.xml/")` returns FALSE — the trailing slash
  makes `path.split("/").pop()` = "" (no dot), so path-sniffing can't catch an endpoint that was
  wrongly given a trailing slash. Fix: `validateRegistry` treats a route as an endpoint when
  `def.isEndpoint === true || isFileEndpoint(path)`, so the slash check (INV-02) is authoritative
  regardless of the malformed slash. Covered by the "file endpoint WITH a trailing slash" test.
- **Deferred (T14):** `case-studies` hub is reserved but non-navigable — needs the hub page,
  `navLabels.caseStudies`, `navPlacement:"primary"`, and a NAV_ORDER slot. `expectedBuildManifest()`
  currently lists `/case-studies/` as a declared static target even though no hub page is built yet;
  it is unconsumed in T2 (the verifier wires it later) so this is not yet a false failure.
- **Deferred:** collection-route per-record expansion in `discoverableRoutes()`/`expectedBuildManifest()`
  (they handle static routes only for now; snapshot-driven expansion lands with case-study content).
- **Scope note:** `scripts/a11y-capture.mjs` has its own local `const ROUTES = Object.keys(EXPECTED)`
  — unrelated to the deleted route-source `ROUTES` array; left untouched.
