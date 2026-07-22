# M1 Proven Static Foundation — Progress

**Bead:** m1-proven-static-foundation
**Started:** 2026-07-22
**Completed:** 2026-07-22
**Status:** complete
**HEAD:** `5116905`

## Task Results

| Task | Commit(s) | Result |
|---|---|---|
| T1 config bootstrap | `c5d2dda` | Astro 5.18.2 / TS 6.0.3 / @astrojs/check 0.9.9 scaffold; npm ci + check + build all 0 |
| T2 publishing policy (RED) | `e18343f` | 14 tests written; stub fails on assertions (not ENOENT) |
| T2 publishing policy (GREEN) | `7a5b1fc` | Visibility enum, evidence variants, date fields, relationship resolution; 14/14 pass |
| T3 routes + adapter (RED) | `e373db2` | +9 tests (23 total); stub fails on canonicalHref assertions |
| T3 routes + adapter (GREEN) | `08954f1` | canonicalHref, isHtmlRoute, isFileEndpoint; content.config.ts imports shared schemas; 23/23 pass |
| T4 discovery rendering (RED) | `b583cfd` | +8 tests (31 total); stub fails on render assertions |
| T4 discovery rendering (GREEN) | `59c5380` | renderSitemap (public-only, XML-escaped), renderRobots (no Disallow); 31/31 pass |
| T5 canonical fixture (RED) | `5c52db7` | +1 integration test (32 total); fixture without canonical fails |
| T5 canonical fixture (GREEN) | `a415277` | Self-canonical probe.astro; fixture build emits one canonical; 32/32 pass |
| T6 read-only verifier (RED) | `03a3e13` | +10 tests (42 total); stub passes everything (wrong) |
| T6 read-only verifier (GREEN) | `28f1717` | verifyBuild: canonical, endpoint, unexpected-route, sitemap-leak, read-only; 42/42 pass |

## Review Summary (5 rounds, quality loop)

| Round | Score | Findings | Fix Commit |
|---|---|---|---|
| 1 | 3/5 | 6: schema purity, verifier coverage (noindex/robots/canonical/origin) | `56cc799` |
| 2 | 3/5 | 3: fail-closed defaults, robots substring matching, canonical boundaries | `c1e233b` |
| 3 | 4/5 | 1: inline comments in robots.txt | `c34566a` |
| 4 | 4/5 | 3: HTML-comment canonicals, inherited collection keys, XML entity decoding | `ed613d4` |
| 5 | 4/5 | 1: single-pass XML entity decode (double-decode edge case) | `5116905` |

Final state: 4/5 (one P3 edge case — double-decode of nested entities like `&amp;lt;` — fixed with single-pass regex). All prior findings resolved. Review nextAction: fix-then-close (4/5 = minor issues, ask user).

## Review Fix Commits

- `f05d625` test: add review-fix assertions (RED)
- `56cc799` fix: address review findings (verifier coverage + schema purity)
- `c1e233b` fix: harden verifier defaults, robots parsing, and canonical boundaries
- `c34566a` fix: strip inline comments in robots.txt directive parsing
- `ed613d4` fix: strip HTML comments from canonicals, guard collection lookup, decode XML entities
- `5116905` fix: single-pass XML entity decode in sitemap loc comparison

## Goal-Backward Verification (success criteria)

| SC | Description | Evidence |
|---|---|---|
| sc-1 | Pinned Astro 5.18.2 / TS 6.0.3 / @astrojs/check 0.9.9 baseline installs and builds | `npm ci` 0; `npm run check` 0 errors/0 warnings; `npm run build` 0; `package.json` deps: astro@5.18.2, devDeps: @astrojs/check@0.9.9 + typescript@6.0.3; `astro.config.mjs` output static, trailingSlash always, site https://example.com |
| sc-2 | Publishing contracts compile and pass policy tests | `npm run check` 0 on publishing.ts, routes.ts, discovery.ts, content.config.ts; 57/57 tests pass; shared Zod schemas consumed by both adapter and Node tests |
| sc-3 | Policy tests pass against synthetic state | `npm test` 57/57 pass; visibility/evidence/relationship/route/canonical/discovery/verifier invariants all asserted |
| sc-4 | Discovery output excludes draft/noindex; one self-canonical; correct slashes; robots visibility-independent; verifier read-only | `npm run build` 0 (dist/sitemap.xml empty urlset + dist/robots.txt); `npm run verify` 0; fixture build proves one self-canonical https://example.com/probe/; robots has no Disallow; verifier snapshot test proves no mutation |

## Final Gate (all 0)

```
npm run check && npm test && npm run build && npm run verify
```

- `npm run check`: 0 errors, 0 warnings (4 hints: pre-existing docs/ brand deprecations)
- `npm test`: 57/57 pass, 0 fail
- `npm run build`: 0 pages, dist/sitemap.xml + dist/robots.txt generated
- `npm run verify`: verify: ok

## Key Artifacts Produced

- `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts` — pinned scaffold
- `src/lib/publishing.ts` — pure Zod schemas + functions (visibility, evidence, dates, relationships)
- `src/lib/routes.ts` — route inventory + canonicalHref helper
- `src/lib/discovery.ts` — renderSitemap (public-only) + renderRobots (visibility-independent)
- `src/content.config.ts` — thin adapter importing shared schemas, registers 5 glob collections + settings file loader
- `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts` — thin endpoint wrappers
- `src/data/sources.json` — empty `{}` evidence registry
- `src/content/settings/site.json` — empty `{}` container (Plan 03 owns first record)
- `tests/policy.test.mjs` — 57 tests (T2-T6 invariants)
- `tests/fixtures/policy-site/{astro.config.mjs,src/pages/probe.astro}` — test-only canonical tracer
- `scripts/verify-build.mjs` — read-only, parameterized root vs fixture verifier

## Next

M1 complete. Next milestone: M2 (Accessible Core Shell) via Plan 03. Switch `.active` to the M2 artifact when starting Plan 03. P02A/P02B may run in parallel.
