# Chapter 5: Implementation Roadmap, Migration, Risks, Decisions, and Research Sources

> Part of [Plan for the Personal Website SEO, Entity, and AI-Search Refactor](../PLAN_FOR_PERSONAL_WEBSITE_SEO_GEO_REFACTOR.md). Research baseline: 2026-07-24; repository baseline: `ad151469db0bab9c5a8c8140680ab5b78d6cbb0c`.

---

## 1. Dependency graph

```text
Phase 0 — Freeze, baseline, and governance
    |
    +--> Phase 1 — Positioning, entity, and evidence inventory
    |       |
    |       +--> Phase 4 — Commercial content production
    |
    +--> Phase 2 — Route/content/SEO kernel
            |
            +--> Phase 3 — Metadata, entity graph, and layouts
                    |
                    +--> Phase 4 — Commercial core
                    |       |
                    |       +--> Phase 5 — Insights
                    |       |
                    |       +--> Phase 6 — Research, conditional
                    |
                    +--> Phase 7 — Discovery and crawler integrations

Phases 4 + 7
    → Phase 8 — Migration, hosted acceptance, and release
        → Phase 9 — Measurement, experiments, and iteration

CMS operations may run in parallel after Phase 2,
but do not block public release unless a later ADR restores that gate.
```

## 2. Phase 0 — Freeze, baseline, and governance

**Goal:** create an auditable starting point and stop planning surfaces from contradicting implementation.

### Tasks

1. Close or explicitly supersede the M2 aggregate state.
2. Record the exact baseline commit.
3. Inventory deployed and externally linked URLs.
4. Determine whether production domain, Search Console, and Bing properties already exist.
5. Export current search/index/traffic data where available.
6. Crawl production and save response, canonical, robots, and sitemap state.
7. Decide which documents remain authoritative.
8. Create ADRs for IA, route registry, Git-first publishing, and crawler policy.

### Expected artifacts

```text
docs/architecture/ADR-003-demand-and-proof-led-ia.md
docs/architecture/ADR-004-single-route-registry.md
docs/architecture/ADR-005-git-first-publishing.md
docs/architecture/ADR-006-ai-crawler-policy.md
docs/baselines/pre-refactor-url-inventory.csv
docs/baselines/pre-refactor-search-baseline.md
```

### Acceptance

- Every known public URL is marked preserve, redirect, remove, or never existed.
- Exact baseline commit and production origin are recorded.
- The stale “no scaffold” statement no longer drives execution.
- Architecture, live state, executable routes, and Git/CI each have one owner.

## 3. Phase 1 — Positioning, entity, and evidence inventory

**Goal:** decide what the public site is allowed to claim before building pages around it.

### Tasks

1. Approve the primary market phrase.
2. Approve the secondary “Agent Systems Builder” descriptor.
3. Choose the initial beachhead and explicit exclusions.
4. Inventory owned public profiles and current bios.
5. Create the canonical Person entity record.
6. Inventory public-safe case-study evidence.
7. Build claim and source registries.
8. Conduct buyer-language interviews or mine real inquiry language.
9. Convert intent hypotheses into a small positioning/content map.
10. Coordinate external-profile updates only after site wording is approved.

### Acceptance

- Homepage proposition can be written without unsupported claims.
- At least one public-safe case study can support the commercial release.
- Every `sameAs` URL is owner-verified.
- The role transition from copy/content work to AI workflow systems is truthful.
- Fit and non-fit conditions are explicit.

### Stop condition

If no real case study can be published, do not invent one. Use a transparent self-project or smaller credibility site, or keep the homepage `noindex` until an evidence strategy is approved.

## 4. Phase 2 — Route, content, and SEO policy kernel

**Goal:** establish the shared typed system before creating new templates.

### Tasks

1. Implement the route registry.
2. Migrate fixed-page configuration into it.
3. Add purpose-specific collections and schemas.
4. Expand publication dates and freshness policy.
5. Implement source/claim validation.
6. Implement hub and service-detail gates.
7. Implement public-safe relationship resolution.
8. Make origin environment-aware and fail production placeholders.
9. Derive verifier expectations from the same registry/content snapshot.
10. Add typed redirects without enabling unverified legacy routes.

### Primary files

```text
src/config/routes.ts
src/config/site.ts
src/config/entities.ts
src/content.config.ts
src/lib/route-registry.ts
src/lib/content-schemas.ts
src/lib/publishing.ts
src/lib/evidence.ts
src/lib/freshness.ts
src/lib/relationships.ts
scripts/verify-build.mjs
tests/route-registry.test.ts
tests/content-schemas.test.ts
tests/evidence.test.ts
tests/publishing-matrix.test.ts
```

### Test-first order

```text
R1. Define registry fixtures and invalid cases
R2. Implement paths and canonicals
R3. Derive nav and breadcrumbs
R4. Map collections
R5. Implement publication/evidence/freshness gates
R6. Derive build manifest
R7. Remove duplicate route sources
```

### Acceptance

- No production path is repeated across multiple configuration owners.
- Existing core route behavior remains correct during migration.
- Visibility parity tests pass across all content types.
- Production builds reject `example.com` and equivalent placeholders.
- Verifier route arrays are generated rather than manually synchronized.

## 5. Phase 3 — Metadata, entity graph, and layouts

**Goal:** make every template emit consistent human- and machine-readable context.

### Tasks

1. Replace ad hoc `SeoHead` props with normalized page metadata.
2. Add complete Open Graph and X/Twitter output.
3. Add JSON-LD graph builders.
4. Add visible breadcrumbs and matching structured data.
5. Add byline, date, source, evidence, and freshness components.
6. Add commercial, case-study, article, and research layouts.
7. Add default and per-record social images.
8. Add RSS discovery behind the Insights gate.
9. Keep metadata fully server/static-rendered.
10. Extend the verifier to inspect metadata and JSON-LD.

### Acceptance

- One canonical metadata object per page.
- Home and About share one canonical Person node.
- Visible and structured dates/authorship match.
- Breadcrumb markup and JSON-LD match.
- No private/draft record leaks into JSON-LD.
- Representative pages pass external validators.
- Existing accessibility behavior remains green.

## 6. Phase 4 — Commercial core

**Goal:** publish the smallest site capable of explaining, proving, and converting the offer.

### Tasks

1. Rebuild Home around approved positioning and proof.
2. Expand Services using the commercial blueprint.
3. Build the Case Studies hub and detail template.
4. Publish the first evidence-approved case study.
5. Expand About with the truthful entity bridge and verified profiles.
6. Expand Contact with fit, process, next step, and privacy expectations.
7. Add contextual links across core pages.
8. Promote Home from `noindex` only after its proof gate.
9. Split service detail pages only if their gates pass.
10. Run content, evidence, metadata, accessibility, and browser review.

### Acceptance

- A new visitor can state who Ryan helps, what he builds, and the next step.
- At least one inspectable proof narrative exists.
- Every public claim resolves to approved evidence.
- All core canonicals appear in sitemap and internal links.
- No empty future module appears in primary navigation.
- Contact works without JavaScript.
- Production origin and social/search metadata are correct.

**Release decision:** Phase 4 may be the first public release. Do not wait for Insights, Research, or a CMS if the release gates pass.

## 7. Phase 5 — Insights

**Goal:** build discoverable editorial authority around services and proof.

### Tasks

1. Approve three launch articles from the pillar map.
2. Use evidence/differentiation briefs.
3. Implement the Insights hub and detail routes.
4. Implement excerpt-only RSS.
5. Add direct answer, key takeaways, byline, sources, and dates.
6. Add curated topic pathways without public taxonomy routes.
7. Connect every article to relevant proof/service.
8. Add correction/update workflow.
9. Notify changed URLs after deployment.
10. Observe real queries before expanding coverage.

### Recommended launch set

1. Agent, script, or process change: how to choose.
2. What makes an AI workflow reliable: context, checks, handoffs, and recovery.
3. How to design a source-grounded content and research workflow.

These are hypotheses; refine them using Ryan's proof and current result analysis.

### Acceptance

- Three differentiated articles are public across at least two connected subtopics.
- The hub contains substantive curation.
- RSS passes visibility and XML tests.
- Each article contains first-hand method, evidence, or credible synthesis.
- No article exists only to cover a phrase variant.

## 8. Phase 6 — Research, conditional

**Goal:** convert the strongest directory/watcher idea into maintained research rather than multiple premature route families.

### Entry gate

Proceed only when:

- the asset supports core authority;
- Ryan can maintain it;
- methodology adds value beyond a vendor list or news feed;
- sources and disclosures are approved;
- stale behavior exists;
- the commercial core is not being delayed.

### Tasks

1. Select one flagship asset.
2. Define method and source schema.
3. Implement freshness/stale behavior.
4. Build the Research layout.
5. Publish `noindex` for review.
6. Validate sources, cutoff dates, limitations, and disclosures.
7. Promote to public.
8. Launch the Research hub only when its gate passes.

### Candidate order

1. Agent Workflow Tools editorial evaluation.
2. LLM Change Log only if Ryan can sustain it and add value beyond release-note aggregation.

### Acceptance

- Method and limitations are visible.
- Every factual entry has a source and reviewed date.
- Stale behavior is tested.
- Static snapshots are never described as live monitoring.
- Commercial or affiliate relationships are disclosed.

## 9. Phase 7 — Discovery and crawler integrations

**Goal:** expose the completed site to selected systems and create reliable feedback channels.

### Tasks

1. Implement typed crawler configuration.
2. Generate robots.txt from approved policy.
3. Add accurate sitemap `lastmod`.
4. Verify Google Search Console and Bing Webmaster Tools.
5. Add IndexNow post-deploy notification if approved.
6. Configure production headers and preview `noindex` behavior.
7. Add analytics only after privacy/value review.
8. Create AI referral and query-panel logging templates.
9. Revalidate crawler docs immediately before release.
10. Record policy ownership and next review dates.

### Acceptance

- Search crawlers can retrieve public pages.
- Training/model-use decisions match owner consent.
- Sitemap is accepted by major search consoles.
- Representative URLs are canonical and inspectable.
- IndexNow, if enabled, submits only changed public URLs.
- No submission is described as an indexing/citation guarantee.

## 10. Phase 8 — Migration, hosted acceptance, and release

**Goal:** change the public architecture without losing continuity or shipping inconsistent output.

### Tasks

1. Freeze content during the migration window.
2. Generate redirects from verified public legacy URLs.
3. Deploy a production-like preview.
4. Crawl preview against the expected manifest.
5. Test real host redirect statuses and chains.
6. Verify unknown URLs return 404.
7. Run browser/accessibility acceptance.
8. Validate structured data, feeds, robots, and sitemap.
9. Promote the exact tested commit.
10. Submit sitemap and changed URLs.
11. Monitor errors, indexing, and contact behavior.
12. Keep a last-good artifact ready.

### Acceptance

- Preserved URLs return 200 and self-canonicalize.
- Migrated URLs redirect once to equivalent targets.
- Old URLs disappear from internal links and sitemap.
- No placeholder origin ships.
- Public content works without JavaScript.
- Host behavior and headers match expectations.
- Rollback has been rehearsed or dry-run documented.

## 11. Phase 9 — Measurement and experiments

**Goal:** refine using observed behavior without reopening the architecture after every fluctuation.

### Tasks

1. Review 30-day crawl/index state.
2. Review 60–90-day query and inquiry language.
3. Refine service copy using qualified conversations.
4. Expand or consolidate Insights based on evidence.
5. Run the manual AI query panel.
6. Correct inaccurate entity summaries through owned properties where possible.
7. Decide whether to test `llms.txt`.
8. Reassess CMS need.
9. Reassess standalone service pages.
10. Record quarterly learnings in the state ledger.

### Experiment contract

```yaml
hypothesis: What observable change is expected?
change: What exactly changes?
baseline: What is true beforehand?
metrics: Which supported signals are recorded?
window: How long is observation?
guardrails: What must not regress?
keep_rule: What evidence supports retention?
remove_rule: What evidence or absence supports removal?
owner: Who decides?
```

## 12. File-by-file refactor map

| Current file | Action | Target ownership |
|---|---|---|
| `astro.config.mjs` | Modify | Environment-driven origin; static output retained |
| `src/config/site.ts` | Refactor | Site identity and labels, not route inventory |
| `src/lib/routes.ts` | Replace/merge | Route registry helpers; remove empty parallel inventory |
| `src/lib/site-routes.ts` | Replace | Generic registry/content resolution |
| `src/lib/publishing.ts` | Extend | Publication and lifecycle invariants |
| `src/lib/content-schemas.ts` | Split/extend | Shared primitives plus purpose schemas |
| `src/content.config.ts` | Extend | Register new collections |
| `src/components/SeoHead.astro` | Refactor | Render normalized metadata |
| `src/layouts/BaseLayout.astro` | Preserve/extend | Shared shell and metadata/entity slots |
| `src/components/SiteHeader.astro` | Refactor | Registry-derived eligible nav; preserve no-JS fallback |
| `src/pages/index.astro` | Rewrite | Evidence-led public homepage after gate |
| `src/pages/[page].astro` | Retire/narrow | Avoid one generic route owning unrelated semantics |
| `src/pages/sitemap.xml.ts` | Generalize | Registry/content-derived sitemap with `lastmod` |
| `src/pages/robots.txt.ts` | Generalize | Typed crawler policy |
| `scripts/verify-build.mjs` | Generalize | Registry-derived manifest and metadata/JSON-LD checks |
| `docs/sitemap.md` | Rewrite | Human projection of registry and gate rationale |
| `.opencode/roadmap.md` | Reconcile | Remove current-state drift |
| `.opencode/state.md` | Update | One live execution state |
| CMS configuration | Defer/adapt | Optional editor over the same schemas |

## 13. Migration strategy

### Stage A — internal architecture, no public URL change

- add registry;
- adapt current routes;
- derive nav/sitemap/verifier;
- prove output parity.

### Stage B — new templates and content in preview

- build Home, Services, Case Studies, and entity graph;
- keep new work `noindex` or preview-protected;
- complete evidence review.

### Stage C — URL migration

- enable new canonicals;
- enable only verified redirects;
- remove old internal links;
- update sitemap and owned profile links.

### Stage D — release and observe

- promote exact accepted SHA;
- submit discovery changes;
- monitor errors/indexing;
- retain rollback artifact and redirect manifest.

### Release manifest

```json
{
  "commit": "<sha>",
  "origin": "https://approved.example",
  "routesHash": "<sha256>",
  "redirectsHash": "<sha256>",
  "sitemapHash": "<sha256>",
  "robotsHash": "<sha256>",
  "builtAt": "<iso8601>",
  "acceptedAt": "<iso8601>"
}
```

## 14. Rollback levels

| Level | Trigger | Action |
|---|---|---|
| Content | Incorrect claim, image, or copy | Revert content commit while preserving route where possible |
| Template | Metadata/layout regression | Revert template or deploy last-good build |
| Route | Redirect/canonical defect | Restore previous route/redirect manifest immediately |
| Full release | Widespread errors or missing pages | Atomic last-good deploy |
| Crawler policy | robots mistake | Correct immediately and record exposure window |

## 15. Major risks

| Risk | Mitigation | Stop trigger |
|---|---|---|
| Too many route families dilute authority | Conditional hubs and minimum-child gates | Hub lacks distinct value/owner |
| Positioning outruns proof | Claim registry and bridge from existing work | Homepage requires unsupported claims |
| Service pages become synonyms | Start with one Services page | Same decision/evidence across pages |
| Research becomes stale | Freshness model, cadence, stale behavior | Review missed without safe output |
| CMS delays learning | Git-first publishing ADR | Infrastructure blocks commercial core |
| Route sources diverge | One registry and derived manifests | Path hand-authored in multiple owners |
| Redirects split equity | Verified inventory and hosted crawl | Old state unknown or intent differs |
| Structured data overclaims | Visible parity and conservative types | Property absent from visible page |
| Crawler policies change | Review dates and release revalidation | Documentation review overdue |
| AI creates commodity content | Human owner, differentiation, kill rule | No first-hand value or useful synthesis |
| Analytics adds privacy burden | Require decision value | Metric maps to no action |
| One-person maintenance overload | Small IA and retirement policy | Backlog exceeds capacity for two cycles |

## 16. Failure behavior

- Missing source on a public claim: build fails.
- Missing public relationship target: build fails.
- Stale research: visible dated warning/demotion when safe; otherwise fail or demote visibility.
- Placeholder production origin: build fails before output.
- Overdue crawler-policy review: warning, then production failure after grace period.
- Structured-data builder failure: public build fails.
- CMS unavailable: public static site is unaffected; author through Git.
- IndexNow failure: deploy remains valid; log/retry while sitemap remains canonical discovery.

## 17. Definition of done

### Architecture

- [ ] One registry owns every canonical route and file endpoint.
- [ ] Nav, breadcrumbs, sitemap, redirects, feeds, and verifier derive from it.
- [ ] Production origin is explicit and placeholder-safe.
- [ ] Git/Markdown can publish without a runtime CMS.

### Entity and positioning

- [ ] Home, About, metadata, JSON-LD, and verified profiles describe the same person/focus.
- [ ] Primary offer uses understandable buyer language.
- [ ] “Agent Systems Builder” is explained and supported by proof.
- [ ] Prior content/copywriting experience is bridged, not erased.

### Content and proof

- [ ] Home is public with approved proof.
- [ ] Services covers fit, deliverables, process, and exclusions.
- [ ] At least one evidence-approved case study is public.
- [ ] Every metric/testimonial/client disclosure resolves to approved evidence.
- [ ] No public hub is empty or thin.

### SEO and discovery

- [ ] Every public page returns 200 and self-canonicalizes.
- [ ] Each public canonical appears once in sitemap.
- [ ] Draft/noindex/redirect URLs never appear in sitemap or RSS.
- [ ] Metadata and structured data match visible content.
- [ ] Search Console and Bing properties are verified.
- [ ] Redirects are one hop and host-tested.

### AI search

- [ ] Search and training crawler policies are separately approved.
- [ ] Robots output matches the decision.
- [ ] Provider review dates are current.
- [ ] Citation-ready pages expose author, dates, evidence, and scoped answers.
- [ ] `llms.txt`, if present, remains explicitly experimental.

### Quality and measurement

- [ ] Type, unit, integration, output, and browser gates pass.
- [ ] No-JS and reduced-motion paths are complete.
- [ ] Screen-reader smoke is completed when tooling exists or remains explicitly blocked with a reopen trigger.
- [ ] Hosted acceptance ties to an exact commit.
- [ ] Rollback is proven.
- [ ] A pre-migration baseline exists.
- [ ] Business/search/AI metrics have owners and review cadence.

## 18. Owner decisions required

| ID | Decision | Recommended default |
|---|---|---|
| D-01 | Canonical production origin | `https://ryanjosebrosas.dev` if verified and owned |
| D-02 | Primary market phrase | AI workflow systems for founder-led teams |
| D-03 | Initial beachhead | Content, research, and knowledge workflows |
| D-04 | First public case study | Strongest permitted real work or transparent self-project |
| D-05 | Projects rename | Case Studies |
| D-06 | Blog rename | Insights; launch after three-entry gate |
| D-07 | Research scope | Agent Workflow Tools first, only if maintainable |
| D-08 | CMS gate | Remove from first public release; retain as optional workflow |
| D-09 | Search crawlers | Allow OAI-SearchBot, Claude-SearchBot, PerplexityBot |
| D-10 | Training/model-use crawlers | Disallow GPTBot, ClaudeBot, Google-Extended by default |
| D-11 | Analytics | Search consoles plus inquiry-source capture first |
| D-12 | `llms.txt` | Post-launch experiment only |
| D-13 | Service detail pages | None initially |
| D-14 | Legacy URL inventory | Verify against host/search data before redirects |
| D-15 | External profile updates | Coordinate after final copy approval |

## 19. Primary research sources

### Repository and planning exemplar

- Ryan Brosas personal website repository: <https://github.com/ryan-brosas/personal-website>
- CASS Memory System golden exemplar: <https://github.com/Dicklesworthstone/cass_memory_system/blob/main/docs/planning/PLAN_FOR_CASS_MEMORY_SYSTEM.md>

### Google Search and crawling

- AI features and your website: <https://developers.google.com/search/docs/appearance/ai-features>
- Helpful, reliable, people-first content: <https://developers.google.com/search/docs/fundamentals/creating-helpful-content>
- Structured-data guidelines: <https://developers.google.com/search/docs/appearance/structured-data/sd-policies>
- Article, ProfilePage, Organization, and Breadcrumb guidance under Search Central.
- Sitemaps: <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap>
- Google crawler documentation, including Google-Extended: <https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers>
- Search Generative AI performance reports announcement, 2026: <https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports>

### AI-search providers

- OpenAI crawler controls: <https://developers.openai.com/api/docs/bots>
- OpenAI publisher/developer FAQ: <https://help.openai.com/en/articles/12627856-publishers-and-developers-faq>
- Anthropic crawler controls: <https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler>
- Perplexity crawler controls: <https://docs.perplexity.ai/docs/resources/perplexity-crawlers>

### Discovery protocols

- Bing Webmaster Guidelines: <https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a>
- IndexNow: <https://www.indexnow.org/documentation>

### GEO and AI-text proposals

- Aggarwal et al., “GEO: Generative Engine Optimization”: <https://arxiv.org/abs/2311.09735>
- Martinez, “Optimizing Visibility in Generative Engines: A Critical Survey of Generative Engine Optimization (2023–2026)”: <https://arxiv.org/abs/2607.14035>
- `llms.txt` proposal: <https://llmstxt.org/>

Crawler and platform documentation is volatile. Re-open every provider source before implementing Phase 7 and update the typed policy review dates.

## 20. Final recommendation

Do not begin with a visual redesign or more route modules.

Execute in this order:

1. approve the entity, offer, and public proof;
2. consolidate route truth into one typed registry;
3. build the evidence, metadata, and entity layer;
4. ship the commercial core;
5. add Insights from real authority;
6. add Research only when maintainable;
7. expose canonical pages to selected search systems;
8. measure qualified outcomes and iterate.

The target website is smaller in conceptual surface area and stronger in evidence, intent, maintainability, and machine/human comprehensibility.
