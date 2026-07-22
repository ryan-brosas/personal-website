# m2-contact-page — Progress

## 2026-07-22 — Shipped (E1 + E2 TDD)

### Commits
| Task | Phase | Commit | Message |
| --- | --- | --- | --- |
| E1 | RED | `ff866e0` | test(m2): define contact settings security contract |
| E1 | GREEN | `a043df6` | feat(m2): enforce contact settings security contract |
| E2 | RED | `578ffab` | test(m2): define Contact route contract |
| plan | docs | `b67abb6` | docs(m2): plan contact route (E1/E2 TDD) |
| E2 | GREEN | `c6dfdf7` | feat(m2): publish Contact page |
| review fix | chore | `d9c87fa` | chore(m2): refresh Contact nav-test comments to match present assertions |

### E1 — Contact settings security contract
- `SettingsDataSchema.contact` made required; `schedulerUrl` = `z.string().url().refine(...)` enforcing `protocol === "https:"` + exact `hostname === "calendly.com"` via parsed URL with `try/catch` (malformed input returns a failed parse, never throws); `privacyRequired` = `z.literal(false)`.
- `src/content/settings/site.json` populated with locked values: `https://calendly.com/ryanjoserbrosas/30min`, `ryanjoserbrosas@gmail.com`, `false`.
- E1 policy tests: 8/8 pass (accept locked; reject absent/partial block, `privacyRequired:true`, HTTP/FTP/mailto/`cal.com`/`www.calendly.com`/lookalike/malformed without throwing; site.json envelope exact-match + validates).

### E2 — Public Contact activation
- `src/content/pages/contact.md` created (public, approved copy).
- `src/pages/[page].astro`: added `getEntry` import; `entry.id === "contact"` branch reads `settings.data.contact` (throws at build time if missing — fail-closed); renders scheduler `<a rel="noopener noreferrer">` + mailto `<a>` after `<Content/>`. Destinations sourced from settings, not hardcoded.
- 5 inherited manifests (B1/B3/C2/C3/D1) + CLI manifest updated with `/contact/`; 4 contact-absent nav assertions flipped to present; D1 favicon route loop adds `/contact/`; C4 contact route test block added.

### Verification gates (all exit 0)
- `npm run check`: 0 errors, 0 warnings, 4 hints
- `npm test`: 122/122 pass
- `npm run build`: 5 pages built
- `npm run verify`: `verify: ok`
- Focused E1: 8/8; focused C4: 1/1

### Generated-output inspection (read-only)
`dist/contact/index.html`: one canonical `https://example.com/contact/`, no noindex, `<a href="https://calendly.com/ryanjoserbrosas/30min" rel="noopener noreferrer">Schedule a conversation</a>`, `<a href="mailto:ryanjoserbrosas@gmail.com">ryanjoserbrosas@gmail.com</a>`, one h1 `Contact`, one script (nav enhancement), no form/iframe/`/privacy/`. `dist/sitemap.xml` includes `https://example.com/contact/`.

### Review
Standard review subagent: **4/5**, one minor actionable finding (3 stale nav-test comments saying "Contact still absent" after assertions flipped). Fixed in `d9c87fa`; tests re-run 122/122. Patch confirmed correct, scope confirmed (only declared feature/plan files in `6af04fd..HEAD`; user-owned `session-summary.md` + `astro.config.preview.mjs` untouched).

### Deviations
None. E2 stayed within the 4-file cohesive exception; no fifth file needed. Resolved interpretation: PRD "no script" = no Contact-specific script (existing progressive-nav script retained, asserted via `assertOneNavScript`).

### Lifecycle (deferred — needs user decision)
Parent lifecycle docs still describe Contact as input-gated and order accessibility before Contact:
- `.opencode/state.md:65-70,80-89`
- `.opencode/artifacts/m2-accessible-core-shell/prd.json:37-60`
- `.opencode/artifacts/m2-accessible-core-shell/plan.md` and `spec.md`
Broader parent-doc wording sync is a separate documentation-only slice; not mixed into E1/E2. Ask user before synchronizing.
