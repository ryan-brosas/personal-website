# Chapter 1: Strategy, Audit, Goals, and Invariants

> Part of [Plan for the Personal Website SEO, Entity, and AI-Search Refactor](../PLAN_FOR_PERSONAL_WEBSITE_SEO_GEO_REFACTOR.md). Research baseline: 2026-07-24; repository baseline: `ad151469db0bab9c5a8c8140680ab5b78d6cbb0c`.

---

## 1. Executive assessment

The repository does **not** need a framework rewrite. Its strongest characteristics should survive the refactor:

- Astro static output;
- strict TypeScript;
- semantic HTML and progressive enhancement;
- a fail-closed `draft | public | noindex` publishing policy;
- evidence-aware content validation;
- canonical and trailing-slash helpers;
- deterministic sitemap generation;
- generated-output verification;
- no-JavaScript and accessibility acceptance.

The major problems are above the framework layer:

1. The roadmap is organized around future modules—Projects, Blog, Directories, Tools, LLM Watcher, and Resources—before the site has established one clear commercial entity and body of proof.
2. Ryan's public footprint still carries strong copywriting/content-strategy signals while the site abruptly leads with “Agent Systems Builder.”
3. Route truth is split across human docs, configuration, page files, navigation code, sitemap code, and verifier arrays.
4. The homepage is intentionally `noindex` and too thin to establish the entity or offer.
5. About, Services, and Contact are structurally clean but commercially and editorially underdeveloped.
6. The production origin remains a placeholder.
7. The current CMS plan is coupled to first release even though the public site is static and Git-backed.
8. Planning documents have drifted from repository reality.

The strategic correction is to move from a **module-first website** to a **demand-and-proof-led authority system**:

```text
Entity
  → clear commercial offer
    → inspectable case studies
      → focused editorial authority
        → maintained research, only after it earns a place
          → search/AI discovery and measurement
```

## 2. Preserve versus refactor

### Preserve

- Static rendering of all indexable content.
- One shared visibility policy for routes, discovery, feeds, relationships, and AI experiments.
- Canonicals derived from code-owned route patterns and an approved origin.
- Evidence before public promotion.
- Primary content and navigation that work without JavaScript.
- Build verification against generated HTML/XML/text rather than framework success alone.
- Structured-data parity with visible content.
- Explicit absence of tags, facets, author archives, empty hubs, and experimental files until a gate is met.

### Refactor

- Replace route fragments with one typed route registry.
- Replace generic page-shaped records with purpose-specific service, case-study, insight, and research schemas.
- Replace launch-by-infrastructure with launch-by-evidence.
- Replace “GEO additions” with retrieval-quality improvements to canonical pages.
- Replace module-led navigation with buyer and authority journeys.
- Replace one optional record-level evidence object with claim-level sources, permissions, and status.

## 3. Recommended decisions

| Area | Decision |
|---|---|
| Framework | Keep Astro static. |
| Publishing | Keep Git/Markdown canonical; make CMS optional. |
| Positioning | Lead with “AI workflow systems for founder-led teams.” |
| Distinctive descriptor | Keep “Agent Systems Builder” as secondary language. |
| Initial beachhead | Content, research, and knowledge workflows. |
| Portfolio label | Rename Projects to Case Studies. |
| Editorial label | Rename Blog to Insights. |
| Directory and watcher | Consolidate under conditional Research. |
| Routing | One typed route registry drives every URL-dependent output. |
| Structured data | A small truthful graph, not schema maximalism. |
| AI crawler policy | Separate search retrieval from model-training consent. |
| `llms.txt` | Post-launch experiment only. |
| Measurement | Qualified business outcomes plus real search/AI discoverability. |
| Migration | Redirect only URLs that genuinely existed publicly. |

## 4. Goals

### Business goals

1. A founder or operator understands Ryan's offer within one screen and one sentence.
2. A qualified visitor can move from problem to service, proof, and contact without searching the site.
3. The site supports international remote acquisition without creating false local-presence signals.
4. Public work compounds into one coherent entity and body of expertise.
5. Publishing and maintenance remain sustainable for one operator.

### Search goals

1. Establish one indexable canonical entity around Ryan Brosas.
2. Earn visibility in a narrow set of connected commercial and informational problem spaces.
3. Ensure every discoverable URL is unique, substantive, canonical, internally linked, and maintained.
4. Give search and answer systems enough context to attribute claims correctly.
5. Connect organic discovery to qualified actions rather than vanity traffic.

### AI-search goals

1. Permit selected AI-search crawlers to retrieve public content.
2. Keep retrieval permission independent from model-training permission.
3. Make important pages citation-ready through scoped answers, evidence, authorship, dates, and sources.
4. Measure inclusion and referrals without claiming control over generated answers.
5. Run experiments only after a production baseline exists.

## 5. Non-goals

- Mass-generated keyword pages.
- One page per synonym, industry, city, or tool without unique value.
- Guaranteed rank, rich results, AI citations, or answer placement.
- A special “GEO schema.”
- Unverified client metrics, logos, testimonials, or confidential artifacts.
- A runtime application shell for readable content.
- Empty Blog, Directory, Tools, Resources, Tags, or Research hubs.
- `llms-full.txt` as a duplicate corpus.
- Treating robots.txt as confidentiality or security control.
- Making CMS, analytics, or CRM infrastructure a prerequisite for a useful public site.

## 6. Architectural invariants

| ID | Invariant |
|---|---|
| INV-01 | Every HTML route has one normalized trailing-slash canonical. |
| INV-02 | File endpoints never receive a trailing slash. |
| INV-03 | `draft` produces no public route or discovery output. |
| INV-04 | `noindex` may be routed but never appears in sitemap, RSS, curation, or related output. |
| INV-05 | Structured data never describes hidden or absent content. |
| INV-06 | Paths, nav, breadcrumbs, sitemap, redirects, and verifier expectations derive from one registry. |
| INV-07 | A hub does not launch before its substantive-child gate. |
| INV-08 | A service subpage requires distinct intent, offer, proof, and internal-link purpose. |
| INV-09 | Every metric or testimonial has an approved evidence reference and scope note. |
| INV-10 | Search-crawler permission is not model-training consent. |
| INV-11 | Public content and primary navigation remain complete without JavaScript. |
| INV-12 | Production builds fail on placeholder origins. |
| INV-13 | Modification dates change only for substantive visible changes. |
| INV-14 | Redirects exist only for verified formerly public URLs or continuity needs. |
| INV-15 | Every AI experiment has a hypothesis, window, owner, guardrails, and remove rule. |

## 7. Governance model

Reduce the number of competing sources of truth:

```text
architecture plan  → durable design and decisions
route registry      → executable URL truth
state ledger        → current milestone and blockers
Git history and CI  → implementation truth
```

Before implementation begins, record the exact baseline commit, inventory live URLs, export any existing search data, reconcile the stale roadmap/state language, and create ADRs for information architecture, the route registry, Git-first publishing, and AI crawler policy.
