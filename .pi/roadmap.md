# Roadmap: Evidence-Led Personal Website

> Deep future-state roadmap. This is planning context, not implementation authorization.
> Master requirements: `.pi/artifacts/website-concrete-plan/plan.md`  
> URL architecture: `docs/sitemap.md`  
> Current blockers: `.pi/state.md`

## Vision

Build an evidence-led expertise system that helps people discover Ryan, understand his
judgment, verify his work, explore connected writing/resources/tools, and take a clear
next action. The mature site remains fast, portable, trustworthy, and useful without
JavaScript while gaining advanced capabilities only when observed needs justify them.

## Governing Strategy

**Discover → understand → verify → explore related expertise → act or return**

Work supplies proof. Writing explains judgment. Resources demonstrate curation. Tools
demonstrate applied capability. These are connected surfaces of one system—not equal,
isolated products competing on the homepage.

## Assumptions to Validate

- Prospective clients/employers are the primary conversion audience.
- Technical peers, tool users, and repeat readers are important secondary audiences.
- Contact about relevant work is the primary CTA.
- Ryan remains the sole author/operator through the first production release.
- Markdown and Git remain acceptable until publishing friction is observed.
- Resources and Tools are optional launch modules, not core-launch requirements.
- A proposed maintenance ceiling is two hours monthly plus a half-day quarterly review.

## Future State

### Visitor experience

- A first-time visitor can identify Ryan's positioning, intended audience, strongest
  evidence, and primary action from the homepage.
- A prospective client/employer can move from a claim to a relevant case study, inspect
  Ryan's exact contribution and trade-offs, then contact him with context.
- A technical peer can enter through writing, reach the applied project/tool, inspect
  sources, and continue through genuinely related content.
- A tool user sees purpose, status, limitations, data behavior, and update expectations
  before use.
- A repeat reader can distinguish new publication, substantive revision, and resource
  verification and can follow stable topics or RSS.

### Content and reputation

- Every public claim is evidence-classified, permissioned, honestly attributed, and
  consistent across visible and machine-readable surfaces.
- Projects mature from card → project → case study without changing `/projects/[slug]/`.
- Articles, guides, resources, notes, projects, directories, and tools have distinct
  quality gates but share one publication system.
- Stale content becomes review-due, archived, redirected, withdrawn, or removed; dates
  are never refreshed merely to appear current.
- No empty hub, thin taxonomy, speculative tool, or unsupported proof is public to meet
  a route or publishing quota.

### Technical platform

- Static HTML remains the authoritative public representation of ordinary content.
- One canonical/visibility policy controls routes, links, sitemap, RSS, tags, related
  content, structured data, search indexes, and optional AI files.
- Every deployment is reproducible from versioned source and validated generated output.
- Search progressively enhances static hubs; live tools are isolated vertical slices.
- Content and configuration remain portable even if hosting, CMS, search, or runtime changes.
- Dynamic data has explicit ownership, export, retention, backup, recovery, and failure behavior.

### Discovery and measurement

- Conventional crawlability, indexability, internal links, useful text, references,
  page experience, and truthful structured data remain primary.
- About, bylines, verified profiles, projects, and schema represent one consistent person/entity.
- Topic growth begins with original proof rather than keyword-volume publishing.
- Search Console, Bing tools, privacy-approved referrals, and bounded manual AI checks
  answer decisions rather than feed a vanity dashboard.
- Experiments have a hypothesis, changed surface, primary measure, guardrail, review
  point, and stop condition.

### Operating model

- Publication, evidence review, redaction, deployment, maintenance, and emergency
  takedown have named owners.
- The previous verified static deployment can be restored.
- Every established URL has retain, redirect, withdraw, or removal behavior.
- Recurring maintenance remains inside an agreed budget; scope stops expanding when it does not.

## Program Tracks

| Track | Purpose | Core outputs |
| --- | --- | --- |
| Positioning & evidence | Make claims credible and actionable | Audience/CTA brief, claim ledger, permission decisions |
| Platform & quality | Preserve URL, visibility, accessibility, and portability contracts | Schemas, helpers, generated-output gates, deployment |
| Work & writing | Build the core expertise graph | Projects/case studies, posts/guides, RSS, relationships |
| Resources & tools | Add useful optional acquisition/product surfaces | Maintained directories, truthful tool pages/live slices |
| Discovery & learning | Improve relevant discovery without SEO theater | Search baselines, topic plans, experiments, policy reviews |
| Governance & operations | Keep the site trustworthy over time | Owners, review queue, maintenance, rollback, deprecation |

Tracks share contracts but should not be bundled automatically. In particular, search,
analytics, CMS, SSR, submissions, and databases are independent promotions.

## Horizon 0 — Launch Contract and Evidence Inventory

**Outcome:** The site has a defensible proposition, route scope, evidence base, and
operating agreement before code exists.

### Deliverables

1. **Launch brief**
   - priority audience and secondary audiences;
   - positioning statement and no more than three capability themes;
   - one primary CTA and contextual secondary actions;
   - domain, preferred host, and hosting choice.
2. **Route manifest**
   - each proposed route marked `launch | defer | draft | noindex | absent`;
   - Resources and Tools included only when useful content exists.
3. **Claim and evidence ledger**
   - candidate projects, role/contribution, outcomes, evidence classification;
   - public/private decision for names, metrics, testimonials, logos, and media;
   - no raw confidential evidence stored in the repository.
4. **Policy register**
   - analytics/privacy choice, crawler/search/training policy, disclosure rules;
   - publication, review, deployment, maintenance, and takedown owners.
5. **Product definitions**
   - first case-study candidate;
   - LLM Watcher's user problem, data source, cadence, and static/live need;
   - first directory's audience, methodology, inventory, owner, and review budget.

### Gate G0

Advance only when:

- every launch route has content, an owner, and a publication disposition;
- every planned public claim is approved, qualified, redacted, or removed;
- the first case-study candidate can satisfy its evidence and privacy gate;
- host/origin, analytics, crawler, and maintenance decisions are recorded;
- the operator explicitly authorizes scaffolding.

**Failure behavior:** shrink route scope rather than fill gaps with placeholders.

## Horizon 1 — Policy Kernel and Representative Build

**Outcome:** A small static build proves the architecture's critical contracts before
content volume or visual expansion.

### Deliverables

1. Pinned Astro/npm scaffold, strict TypeScript, static output, validated commands.
2. Site identity/origin, shared schemas, canonical URL helper, visibility policy,
   semantic base layout, and minimal representative fixtures.
3. Generated-output checks covering:
   - one absolute self-canonical per indexable page;
   - HTML trailing slashes and file-endpoint exceptions;
   - draft/noindex/retired/withdrawn behavior;
   - internal links, sitemap, RSS, JSON-LD, metadata, and placeholder origin;
   - complete no-JS content and representative accessibility semantics.
4. Sitemap filtering and robots-generation mechanics wired to shared policy; final bot
   choices wait for production review.

### Gate G1

- All representative fixtures pass the output contract.
- No private/draft fixture leaks into any route or discovery artifact.
- The build fails on malformed schemas, internal references, invalid lifecycle states,
  duplicate canonicals, and visibility drift.
- The implementation remains static and contains no speculative runtime service.

**Rollback:** revert to the last passing foundation increment; do not weaken gates to
admit content.

## Horizon 2 — Core Portfolio Vertical Slice

**Outcome:** A real visitor can understand, verify, and act using genuine content.

### Deliverables

1. Home, About, Contact, and primary navigation.
2. Projects hub and at least one evidence-backed project/case study.
3. Blog hub, at least one substantive related post/guide, and RSS.
4. Tags only where authored context and the publication threshold are met.
5. Bidirectional project-writing relationships sourced from one canonical relationship model.

The initial release does **not** require a directory, LLM Watcher, multiple case studies,
or an arbitrary content quota if those items are not ready.

### Gate G2

- At least three representative reviewers can identify Ryan's audience/value, find the
  strongest proof, and locate the primary CTA without prompting.
- The case study states role, contribution, decisions, evidence, attribution limits,
  trade-offs, and permissions.
- Homepage proof is derived from approved evidence rather than duplicated claims.
- Human pages and machine outputs pass the same redaction review.
- No low-confidence related links or thin tag pages are generated.

**Failure behavior:** return content to draft or simplify the homepage; do not publish
unsupported proof.

## Horizon 3 — Production Launch and Operational Baseline

**Outcome:** The core portfolio is safely deployable, measurable, reversible, and maintainable.

### Deliverables

1. Production-like checks for HTML/XML/text, images, keyboard operation, narrow screens,
   no-JS behavior, redirects, and host-specific trailing-slash behavior.
2. Immutable deployment flow with preview, production promotion, prior verified artifact,
   rollback instructions, and emergency content-removal procedure.
3. Final production origin, HTTPS, preferred-host, slash, and legacy redirect matrix.
4. Revalidated crawler-policy register with exact official source, purpose, decision,
   owner, review date, and production result.
5. Google/Bing verification and sitemap submission where desired.
6. Baseline record: intended/indexable URLs, platform-reported issues, relevant queries,
   qualified referral/inquiry definitions, and performance/accessibility observations.

### Gate G3

- Production origin, redirects, canonicals, internal links, sitemap, RSS, robots, and
  rendered metadata agree.
- Zero placeholder origins, discovery leaks, unsupported claims, or broken internal links.
- The prior deployment can be restored and emergency removal can update every discovery surface.
- Indexing and ranking are monitored outcomes, never launch guarantees.

**Rollback:** restore the prior verified static artifact and previous robots/redirect
policy; investigate before redeploying.

## Horizon 4 — Connected Expertise and Reliable Return Value

**Outcome:** Work and writing become a sustainable, connected body of expertise that
provides value to repeat visitors.

### Deliverables

- Additional projects/case studies only when evidence-ready.
- Controlled topic pillars, each anchored by original work and supporting writing.
- Series hubs only after authored context and enough public installments exist.
- Editorial states: draft, review, approved, published, archived, withdrawn.
- Actionable editorial report for evidence blockers, overdue reviews, broken links,
  orphaned pages, missing disclosures, taxonomy drift, and discovery mismatches.
- Cornerstone versus recent/updated homepage treatment.
- Truthful `published`, `updated`, `reviewedAt`, and `lastVerified` semantics.

### Gate G4

- A complete publish → review → update/archive cycle succeeds.
- A visitor entering through any core pillar can reach a genuinely related second pillar.
- Each topic pillar contains original proof, references, deterministic links, and a
  defined audience outcome before it expands.
- Quarterly review can be driven from one exception queue without manual archaeology.

**Failure behavior:** pause expansion, merge weak content, or archive it; never reset dates
or generate more pages to hide quality debt.

## Horizon 5 — Optional Resource and Tool Modules

**Outcome:** Resources and tools add distinct user value with funded maintenance instead
of expanding the sitemap for its own sake.

### Directory promotion gate

Launch a directory only when it has:

- a defined audience, scope, methodology, and inclusion/exclusion rules;
- original useful inventory with disclosures and limitations;
- an owner, review cadence, and maintenance budget;
- conditional detail pages that add substantive evaluation beyond hub rows.

If monthly maintenance exceeds the agreed ceiling, stop adding entries, show truthful
review-due states, reduce scope, or archive the directory.

### Tool promotion gate

Launch a tool only when its purpose, inputs, outputs, limitations, data handling, update
cadence, and success signal are defined.

- `planned`: explanatory and normally `noindex`.
- `beta`: usable but visibly incomplete.
- `live`: verified behavior and operational ownership.
- `retired`: preserved with context, redirected, or removed by explicit decision.

LLM Watcher does not become live infrastructure until its data and freshness needs are proven.

### Gate G5

- Each module demonstrates a user journey unavailable from the core portfolio alone.
- Its maintenance cost fits the agreed budget.
- Failure or retirement cannot break the core content site.
- Private/user-specific data stays out of static output and all discovery artifacts.

## Horizon 6 — Measured Discovery and Experiments

**Outcome:** Discovery improvements are tied to relevant reach, qualified behavior, and
credible references rather than vanity traffic or prompt anecdotes.

### Measurement layers

| Layer | Decision-oriented evidence |
| --- | --- |
| Technical health | Contract pass rate, discovery leaks, indexing/canonical issues |
| Relevant reach | Target-topic discovery by query/page; evidence assets discovered |
| Qualified behavior | Evidence-to-CTA journeys, suitable inquiries, meaningful tool actions |
| References | Attributable referring pages and qualified referral sources |
| AI observation | Fixed small query panel and observed referrals/citations, clearly limited |

### Experiment protocol

Every experiment records hypothesis, changed pages, primary measure, guardrail, start,
review point, and stop/rollback condition. Cold-start results are descriptive. Continue a
change only when it persists across two review windows without harming technical health,
credibility, privacy, or qualified outcomes.

Priority experiments:

1. Answer-first versus narrative-first introductions.
2. Stronger evidence and limitation blocks in case studies.
3. Citation placement and source clarity.
4. Pinned relationships versus tag-only recommendations.
5. Directory hub rows versus genuinely substantive detail pages.
6. Sustainable distribution channels and message fit.

### AI-specific experiment gate

A curated `llms.txt` may launch only from the shared visibility policy with a written
usage hypothesis. After two review cycles, keep or expand it only if logs, a named
consumer, or repeatable retrieval use demonstrates value. Otherwise park it. Do not add
`llms-full.txt` or Markdown twins merely because the proposal exists.

## Horizon 7 — Evidence-Triggered Platform Evolution

**Outcome:** Advanced capabilities solve observed operational/user problems while the
core site remains static, portable, and reversible.

| Capability | Promotion trigger | Smallest justified step | Fallback |
| --- | --- | --- | --- |
| Client search | ~50 public entries or repeated navigation failures | Build-time public index, progressively enhanced page | Hubs, tags, curated links |
| Server search | Static index violates an agreed budget or needs live/private data | Isolated typed search endpoint | Build-time index |
| Analytics | A named decision cannot be answered manually/platform-side | Minimal aggregate events with approved retention | No analytics |
| CMS | Recurring contributor needs or Git blocks at least three intended releases | Adapter preserving schemas and Markdown export | Repository workflow |
| Multiple authors | A second recurring author/editor exists | Controlled author records and approval ownership | Single author |
| Public submissions | Moderation, consent, retention, abuse, deletion, and ownership exist | Private queue; never auto-publish | Owner curation |
| SSR/API | Freshness, secret, persistence, authentication, or server execution is required | Isolated live tool slice | Static snapshot/manual refresh |
| Database | Durable shared state cannot remain versioned content | Exportable schema, retention, backup/restore test | JSON/Markdown dataset |
| Advanced observability | A dynamic service has an incident or defined availability objective | Redacted actionable metrics/alerts | Structured logs/manual review |
| Generated OG images | Manual work repeatedly delays publication | Deterministic build generation | Approved default image |

### Dynamic-service contract

Any live vertical slice requires typed input/output, validation, timeout, safe error state,
redacted logs, availability check, source attribution, credential isolation, and a static
explanatory fallback. Its outage must not remove the surrounding content page.

## Governance and Maintenance

### Per publication

- schema and internal-reference checks;
- editorial, evidence, disclosure, and redaction passes;
- generated-output inspection for visible and machine surfaces.

### Monthly — proposed maximum two hours

- external-link warnings and overdue resource reviews;
- tool status, dependency/security alerts, production smoke checks;
- unresolved claim/evidence and publication blockers.

### Quarterly — proposed maximum half day

- homepage proof and positioning review;
- orphaned content, taxonomy, archive, accessibility, and structured-data review;
- crawler-policy and analytics/privacy review;
- maintenance budget and optional-module continuation decisions.

### URL deprecation rules

- Never silently repurpose an established URL.
- Exact successor: one-hop permanent redirect.
- Useful history: retain `200`, visibly archived/retired, truthful dates.
- No successor: `410` where supported, otherwise `404`.
- Confidential/accidental publication: remove immediately; `noindex` is insufficient.
- Remove a URL from hubs, related content, sitemap, RSS, tags, search, and AI outputs in
  the same release.

## Dependency Graph

`G0 launch contract → G1 policy kernel → G2 core slice → G3 production launch`

After G3:

- `G4 connected expertise` is the default growth path.
- `G5 directories/tools` proceeds module by module when each gate passes.
- `G6 discovery experiments` uses the production baseline.
- `G7 platform evolution` promotes capabilities independently from observed triggers.

Mature operations, measurement, and content work may run in parallel, but all depend on
the shared URL/visibility kernel. Optional modules must never block or destabilize core launch.

## Program Measures

### Non-negotiable health measures

- 100% of intended public URLs pass canonical, visibility, metadata, and internal-link checks.
- Zero private/draft/withdrawn leaks across routes or discovery outputs.
- Zero known unsupported homepage/case-study claims.
- Zero broken internal links and placeholder production origins at release.
- Every recurring public collection has an owner and lifecycle behavior.

### Learning measures

- Can representative visitors explain Ryan's value and locate proof/action?
- Do qualified inquiries or referrals mention specific evidence, capability, or content?
- Which topic pillars produce relevant discovery and return behavior?
- Which resources/tools solve recurring user problems?
- Which maintenance tasks exceed the agreed budget?

Do not set traffic, ranking, publication-volume, or AI-citation quotas before a real
baseline and decision context exist.

## Risks and Guardrails

| Risk | Guardrail |
| --- | --- |
| Diluted positioning | One primary audience/CTA; secondary actions remain contextual |
| Unsupported credibility | Claim ledger and publication gate; draft on uncertainty |
| Confidentiality leak | Review HTML, JSON-LD, OG, RSS, sitemap, search, and AI files |
| Scope dilution | Core portfolio launches independently of optional modules |
| Visibility drift | One policy plus an output contract matrix |
| Thin-content growth | Cards/rows are valid; no route without distinct user value |
| False freshness | Separate editorial updates from verification/review dates |
| Platform creep | Every service needs a trigger, owner, fallback, and rollback |
| Analytics overreach | Collect only approved fields tied to named decisions |
| Search replacing IA | Preserve complete no-JS hubs, tags, and links |
| Reputation incident | Immediate withdrawal from all surfaces and documented takedown |
| AI-search theater | Fundamentals first; experiments carry no ranking/citation promise |

## Never Build Without Evidence

- Separate case-study URLs or duplicate canonical representations.
- SSR, APIs, databases, auth, accounts, or user state for hypothetical needs.
- Public submissions without moderation, privacy, abuse, and deletion workflows.
- A CMS because it is conventional rather than because publishing is blocked.
- Search before content volume or observed navigation failure.
- Deep facets, thin detail pages, mechanically generated tags, or URL-count projects.
- A directory without a funded owner and sustainable review cadence.
- LLM Watcher before its purpose and data lifecycle are defined.
- `llms-full.txt`, Markdown twins, or AI markup without a named consumer or measured use.
- Analytics without purpose, retention, and privacy decisions.
- Testimonials, metrics, logos, awards, or superlatives without evidence and permission.
- Structured data that does not describe visible facts.
- A generic extension framework for hypothetical future sections.

## Open Operator Decisions

1. Is the primary audience clients, employers, or a narrower group?
2. What single primary action should the strongest journey end with?
3. Which project can pass the first case-study evidence and permission gate?
4. Which names, metrics, media, logos, and testimonials may be public?
5. What domain, preferred hostname, and static host should be used?
6. Are Resources and Tools part of core launch or deferred modules?
7. What exact problem, data source, update cadence, and success signal define LLM Watcher?
8. Should model-training access be allowed, denied, or decided provider by provider?
9. What analytics/privacy posture is acceptable, and which decisions must analytics answer?
10. Who owns publication, evidence review, redaction, deployment, maintenance, and takedown?
11. Where are private evidence and permission records retained outside the repository?
12. Is the proposed monthly/quarterly maintenance ceiling realistic?

## Immediate Next Step

Complete **Horizon 0** as a standalone launch-brief and evidence-inventory plan. Do not
scaffold until Gate G0 passes and the operator explicitly authorizes implementation.
