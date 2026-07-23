# Chapter 2: Positioning, Information Architecture, Journeys, and Page Blueprints

> Part of [Plan for the Personal Website SEO, Entity, and AI-Search Refactor](../PLAN_FOR_PERSONAL_WEBSITE_SEO_GEO_REFACTOR.md). Research baseline: 2026-07-24; repository baseline: `ad151469db0bab9c5a8c8140680ab5b78d6cbb0c`.

---

## 1. Audience and positioning

### Primary audience

Founder-led and lean teams with recurring knowledge work that is slow, inconsistent, or trapped in one person's head.

Typical conditions:

- fewer people than responsibilities;
- repeated research, writing, reporting, coordination, or operational work;
- tools that do not share context;
- failed automations that break on exceptions;
- concern about quality, approval, and recovery;
- no desire to hire a large transformation consultancy.

### Secondary audiences

- operators evaluating AI workflow approaches;
- technical collaborators assessing implementation quality;
- content teams and agencies with repetitive research/production systems;
- readers discovering Ryan through practical writing or maintained research.

### Core buyer jobs

| Job | Problem/search language | Required evidence |
|---|---|---|
| Find work worth automating | workflow audit, automation consultant, workflow bottlenecks | Diagnostic process and selection criteria |
| Build a reliable AI workflow | AI agent workflow, human-in-the-loop automation | Architecture, checks, handoffs, recovery |
| Repair fragile automation | agent reliability, workflow evaluation | Failure analysis, tests, monitoring |
| Scale content/research operations | AI content workflow, research automation | Editorial safeguards, provenance, quality controls |
| Reduce founder dependence | founder bottleneck automation, recurring-work systems | Documentation, ownership handoff, repeatability |

These are intent hypotheses, not keyword-volume forecasts. Validate them through real conversations, Search Console, and result analysis.

### Recommended positioning stack

- **Market category:** AI workflow systems
- **Primary audience:** founder-led teams
- **Outcome:** remove repetitive knowledge work without losing judgment, quality, or recoverability
- **Distinctive role:** Agent Systems Builder
- **Initial beachhead:** content, research, and knowledge workflows

Recommended homepage framing:

```text
Eyebrow: Ryan Brosas · Agent Systems Builder
H1: AI workflow systems for founder-led teams.
Support: I design reliable agents, automations, and content operations that remove recurring work while keeping context, checks, human approval, and recovery paths explicit.
```

This is planning copy, not automatically approved final copy. It must be reconciled with public proof.

### Positioning bridge

Do not erase Ryan's copywriting/content-strategy history. Use it as the credibility bridge:

```text
copywriting and content systems
  → practical AI-assisted content/research operations
    → reliable workflow and agent systems
      → broader founder operations after proof accumulates
```

### Guardrails

- Do not lead with technical mechanics before the buyer outcome.
- Do not claim enterprise transformation or autonomous decision-making without proof.
- Do not create U.S. local pages or imply a physical office Ryan does not have.
- Use “AI agency” only if Ryan intentionally operates as an agency.
- Explain “agent systems” with visible examples, checks, and failure handling.

## 2. Target sitemap

### Core launch routes

| Route | Primary job | Launch gate |
|---|---|---|
| `/` | Entity, positioning, proof, next action | Approved offer, at least one proof unit, complete metadata |
| `/services/` | Commercial offer and fit | Problems, outcomes, deliverables, process, exclusions, CTA |
| `/case-studies/` | Proof hub | At least one approved case study and substantive hub copy |
| `/case-studies/[slug]/` | Evidence-led work narrative | Claim-level evidence, permission, outcomes, limitations |
| `/about/` | Person, experience, methods, trust | Consistent bio and verified profiles |
| `/contact/` | Qualification and next action | Accurate scheduler/email, expectations, privacy review |
| `/404.html` | Recovery | Real 404 behavior on host |
| `/sitemap.xml` | Discovery | Registry-derived public canonicals only |
| `/robots.txt` | Crawler policy | Typed and tested production-origin output |

### Conditional editorial routes

| Route | Gate |
|---|---|
| `/insights/` | Three substantive public entries across at least two connected subtopics |
| `/insights/[slug]/` | Original experience, method, analysis, or synthesis; source and author fields complete |
| `/rss.xml` | Insights hub public; excerpt-only; absolute URLs; public records only |

### Conditional service detail routes

Start with one strong `/services/` page. Split only after proof and demand show that a stable detail URL deserves to exist.

Candidates:

- `/services/ai-workflow-systems/`
- `/services/agent-reliability/`
- `/services/content-research-operations/`

Each requires a distinct buyer decision, differentiated offer, proof, and internal-link role.

### Conditional research routes

| Route | Gate |
|---|---|
| `/research/` | Two substantial assets, or one flagship maintained asset with method and cadence |
| `/research/agent-workflow-tools/` | Editorial evaluation, methodology, source/disclosure/freshness controls |
| `/research/llm-change-log/` | Named sources, separate dates, owner, limitations, stale behavior |
| `/research/[slug]/` | Asset-specific method and maintenance gate |

Research belongs in secondary navigation until it proves recurring value. It must not become a dumping ground.

### Conditional legal and experimental routes

- `/privacy/` only when forms, scheduling, analytics, embeds, or obligations require it.
- `/llms.txt` only after a production baseline, explicit hypothesis, generated canonical inventory, parity tests, and review/removal date.

### Explicitly absent

- `/tags/`, `/categories/`, `/authors/` before a corpus demands them;
- `/resources/` as a generic umbrella;
- `/projects/` and `/blog/` after verified migration to Case Studies and Insights;
- `/directories/` and `/tools/` as separate thin route families;
- site search for a small corpus;
- indexable query/filter states;
- location pages without a genuine location-specific operation;
- generic glossary pages;
- AI-generated summaries as separate URLs.

## 3. Sitemap tree

```text
/
├── services/
│   ├── ai-workflow-systems/             [conditional]
│   ├── agent-reliability/               [conditional]
│   └── content-research-operations/     [conditional]
├── case-studies/
│   └── [slug]/
├── insights/                            [conditional]
│   └── [slug]/
├── research/                            [conditional]
│   ├── agent-workflow-tools/            [conditional]
│   ├── llm-change-log/                  [conditional]
│   └── [slug]/
├── about/
├── contact/
└── privacy/                             [conditional]

/sitemap.xml
/robots.txt
/rss.xml                                 [with Insights]
/llms.txt                                [experiment only]
/404.html
```

## 4. Content gates

A gate is a value test, not a word-count quota.

### Hub gate

A hub becomes public only when it has:

- a distinct audience and purpose;
- substantive introduction or methodology;
- enough eligible public children;
- no draft/noindex leaks;
- a clear next action;
- a maintenance owner.

Recommended thresholds:

| Hub | Minimum |
|---|---|
| Case Studies | One strong case study plus substantive context; two preferred |
| Insights | Three public entries across two connected subtopics |
| Research | Two substantial assets, or one flagship maintained asset with explicit method/cadence |
| Service sub-navigation | Two proven standalone service pages; otherwise retain one Services page |

### Detail-page gate

A detail page must do something its parent cannot. It needs at least one of:

- unique primary evidence;
- a distinct buyer decision;
- a repeatable method;
- a maintained dataset/evaluation;
- original analysis or first-hand experience.

## 5. URL migration policy

First determine which planned URLs were actually public and externally linked. Never create redirect debt for routes that only existed in planning.

| Old/planned route | Target | Default |
|---|---|---|
| `/projects/` | `/case-studies/` | Permanent redirect only if old route was public |
| `/projects/[slug]/` | `/case-studies/[slug]/` | Per verified public slug |
| `/blog/` | `/insights/` | Only if old route was public |
| `/blog/[slug]/` | `/insights/[slug]/` | Per verified public slug |
| `/directories/` | `/research/` | Only after Research exists and intent matches |
| `/tools/llm-watcher/` | `/research/llm-change-log/` | Only after equivalent target is public |
| `/resources/` | `/research/` or removal | Only if it was public and Research is a true successor |

Migration invariant:

```text
old public URL
  → one permanent redirect
    → target returns 200
      → target self-canonicalizes
      → sitemap and internal links use target only
```

Use 308 where supported correctly; 301 is acceptable where the host does not support 308 consistently. Never create chains.

## 6. Navigation

### Primary navigation

```text
Services | Case Studies | Insights | About | Contact
```

Rules:

- Hide Insights until its gate passes.
- Keep Research secondary until it becomes a proven acquisition path.
- Present Contact as a distinct action while retaining a normal accessible link.
- Keep the brand/home link outside the primary `<nav>`, preserving the current implementation pattern.

### Footer groups

```text
Work: Services, Case Studies
Learn: Insights, Research, RSS (only when public)
Ryan: About, Contact, verified GitHub/LinkedIn
Policies: Privacy (when required)
```

## 7. User journeys

### Commercial journey

```text
Homepage problem/outcome
  → Services fit and offer
    → Relevant case study
      → Contact qualification
```

### Editorial journey

```text
Search or AI referral
  → Insight with direct answer and evidence
    → Related method/case study
      → Relevant service
        → Contact
```

### Research journey

```text
Search or citation
  → Research asset
    → Methodology, sources, freshness
      → Related insight/case study
        → About or service
```

### Internal-link rules

1. Every public page except Home has a contextual inbound link.
2. Every insight links to a relevant pillar/service or explicitly has no commercial relationship.
3. Services link to proof; case studies link back to the method/service demonstrated.
4. Breadcrumbs reflect hierarchy, not nav order.
5. Related blocks never include draft/noindex records.
6. Anchor text is descriptive and natural, not mechanically exact-match.

## 8. Page blueprints

### Homepage

1. Identity, audience, outcome, primary CTA, proof CTA.
2. Problem recognition and fit.
3. System model: context, execution, checks, human handoff, recovery.
4. Featured evidence.
5. Offers.
6. Selected Insights after launch.
7. About/trust block.
8. Final CTA with what happens next.

The homepage becomes public only after it includes approved proof.

### Services

1. Direct answer: what Ryan helps with.
2. Fit and non-fit problems.
3. Offers such as Workflow Systems Audit, Build Sprint, Reliability/Optimization.
4. Deliverables.
5. Process and client responsibilities.
6. Security/privacy/tool constraints.
7. Relevant case studies.
8. Real objection-handling content.
9. Contact CTA.

### Case study hub

Explain evidence/redaction standards, present each study by problem and outcome, and avoid empty filters.

### Case study detail

```text
Executive summary
Context and disclosure level
Problem and baseline
Constraints and risks
Ryan's role
Architecture/process
Decisions and trade-offs
Implementation
Verification and failure handling
Results
Evidence scope and limitations
Artifacts
What changed afterward
Related service/insight
CTA
```

### Insights hub and articles

Hub: editorial scope, curated topic pathways, cornerstone pieces, dates, RSS, no empty taxonomy UI.

Article:

1. Clear title matching the real question.
2. Direct answer/thesis.
3. Key takeaways.
4. Audience and scope.
5. First-hand context, method, or source basis.
6. Analysis with descriptive headings.
7. Examples/diagrams/artifacts.
8. Trade-offs and failure cases.
9. Sources.
10. Author, published, modified, reviewed dates.
11. Correction/update note where needed.
12. Related proof/service.

### Research asset

Every maintained asset displays its question, scope, exclusions, methodology, source set, cutoff date, last reviewed date, cadence, disclosure, limitations, stale state, and material change log.

### About

The canonical human-readable entity page: name, current focus, truthful bridge from prior work, relevant experience, methods, working mode, Philippine location/remote availability, verified profiles, proof, and contact.

### Contact

State who should contact Ryan, what project information to provide, the first step, scheduler/email fallback, response expectations if supportable, and privacy/data-use implications. Add a form only when it improves qualification or conversion enough to justify its complexity.
