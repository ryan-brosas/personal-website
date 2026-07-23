# Chapter 4: Editorial Authority, Measurement, Testing, and Quality Gates

> Part of [Plan for the Personal Website SEO, Entity, and AI-Search Refactor](../PLAN_FOR_PERSONAL_WEBSITE_SEO_GEO_REFACTOR.md). Research baseline: 2026-07-24; repository baseline: `ad151469db0bab9c5a8c8140680ab5b78d6cbb0c`.

---

## 1. Authority model

Topical authority is not the number of pages containing related phrases. For this site, authority should emerge from:

```text
first-hand work
+ explainable method
+ approved evidence
+ useful analysis
+ one consistent entity
+ external corroboration
```

The content system should therefore begin with proof and methods, then expand into informational coverage. It should not begin with a keyword spreadsheet and manufacture thin pages around it.

## 2. Initial authority pillars

### Pillar 1: AI workflow systems

Commercial destination: `/services/`

Candidate Insights:

- How to identify recurring work worth automating.
- Agent, script, or process change: a decision framework.
- Where human approval belongs in an AI workflow.
- Why recovery paths matter more than polished demos.
- A practical workflow-system audit checklist.

Proof relationships:

- case studies involving recurring work;
- architecture diagrams;
- before/after process artifacts;
- failure and recovery tests.

### Pillar 2: Agent reliability and evaluation

Commercial destination: initially `/services/`; later a service detail page only after its gate.

Candidate Insights:

- What makes an agent workflow reliable.
- Checks, handoffs, and failure escalation.
- Evaluating output without creating a second full-time review job.
- Common context failures in multi-step workflows.
- Designing for partial failure.

### Pillar 3: Content and research operations

Commercial destination: `/services/` or a later earned service detail page.

Candidate Insights:

- Building source-grounded research workflows.
- Where AI content systems fail editorial review.
- Reusing knowledge without propagating stale claims.
- Separating generation, verification, and approval.
- A content-operations system for founder-led teams.

### Pillar 4: Context and knowledge systems

Conditional until public implementation proof exists:

- durable context design;
- memory and retrieval;
- source-of-truth architecture;
- correction propagation;
- handoff context between agents and humans.

## 3. Content brief contract

Every proposed Insight must answer:

```yaml
business_relationship: Which service, case study, or trust objective does this support?
audience: Who has this problem now?
question: What exact decision or problem does the page resolve?
existing_results: What do current results cover well or poorly?
ryan_advantage: What first-hand experience, evidence, method, or synthesis can Ryan add?
sources: Which primary sources are required?
proof: Which public artifact or example can be shown?
scope: What will the page not claim?
next_step: Where should a qualified reader go next?
freshness: Is this evergreen, event-driven, or review-dated?
kill_rule: What would make this page not worth publishing?
```

A page does not pass because it is long or mentions a target phrase. It passes when it resolves a real decision with a defensible author advantage.

## 4. Editorial workflow

```text
Idea
  → intent and business-fit review
    → evidence/source collection
      → outline and differentiation check
        → draft
          → fact/evidence review
            → accessibility and SEO review
              → preview
                → publish
                  → observe
                    → update, consolidate, redirect, or retire
```

### Lifecycle behavior

| State | Behavior |
|---|---|
| `draft` | No route or discovery output |
| `noindex` | Reviewable/transitional route; excluded from discovery and curation |
| `public` | Canonical and eligible for sitemap, relationships, and relevant feeds |
| stale | Derived workflow state; visible warning or demotion when safe, otherwise promotion fails |
| retired | Redirect to an equivalent successor, or intentional 410/archive behavior |

### Update and consolidation rules

- Update when facts, tools, dates, or the recommended decision materially change.
- Consolidate overlapping pages before adding a new phrase variant.
- Redirect only when the successor satisfies substantially the same intent.
- Use 410 only for a formerly public URL with no useful replacement.
- Never change dates solely to appear fresh.
- Record material corrections when the previous conclusion or claim was wrong.

## 5. External authority and entity consistency

1. Verify all owned profiles.
2. Align short biography and current focus across GitHub, LinkedIn, X, and real author pages.
3. Link verified identities bidirectionally where appropriate.
4. Publish case studies and technical notes collaborators can legitimately reference.
5. Seek client/partner links only when truthful and useful.
6. Contribute original analysis to relevant publications or communities.
7. Avoid paid link schemes, mass guest posts, synthetic citation networks, and unearned awards.

## 6. Measurement hierarchy

```text
Business outcomes
  ↓
Qualified actions
  ↓
Service and proof engagement
  ↓
Search and AI discovery
  ↓
Crawl and index health
  ↓
Publishing inputs
```

### Primary business measures

- qualified inquiries per month;
- inquiry-to-conversation rate;
- case-study-assisted inquiries;
- conversations attributed conservatively to organic or AI-assisted visits;
- revenue or pipeline influenced by the site where attribution is supportable.

### Search measures

- valid indexed canonical pages;
- excluded pages by intended reason;
- nonbrand impressions and clicks;
- queries grouped by problem and service intent;
- country/device distribution;
- service and case-study landing-page performance;
- sitemap, crawl, canonical, and structured-data errors.

### AI-search measures

- identifiable referrals from ChatGPT and other systems;
- landing pages receiving AI referrals;
- supported Search Console generative-AI reports when available to the property;
- manual citation observations from a fixed query panel;
- citation accuracy and entity attribution;
- declared crawler requests in server logs when logs are available and privacy-compatible.

Do not collapse these signals into one proprietary “GEO score.”

## 7. Manual query panel

Maintain a small reproducible panel rather than hundreds of prompts.

Example categories:

```text
commercial
- consultant for reliable AI workflows for a small team
- help automating recurring content and research work

problem-aware
- how to decide if a workflow should use an AI agent
- how to make an agent workflow reliable

entity
- who is Ryan Brosas
- what does Ryan Brosas do

proof
- examples of human-in-the-loop AI workflow systems
- case study for AI content operations workflow
```

For each observation record:

- exact query;
- engine/product;
- date and locale/context;
- whether the site appeared;
- whether it was linked or cited;
- cited URL;
- summary accuracy;
- competing sources;
- screenshot/export where permitted;
- explicit reminder that the result is nondeterministic.

Review monthly during early growth, then quarterly after patterns stabilize.

## 8. Baseline and analytics decisions

Before public URL changes:

- export Search Console pages and queries if a property exists;
- inventory indexed URLs;
- capture external-link data where available;
- crawl production and record response/canonical/robots states;
- save the sitemap;
- record existing AI referrals and query-panel observations, including zero.

Search Console and Bing Webmaster Tools are required operational sources. General analytics is optional. Choose among lightweight privacy-conscious analytics, host logs, scheduler attribution, or no general analytics initially. Do not add a consent burden or third-party script for metrics that do not drive decisions.

## 9. Review cadence

### Weekly during release

- deploy and crawl failures;
- indexing anomalies;
- redirect defects;
- broken contact paths.

### Monthly

- qualified actions;
- query/page changes;
- content gaps surfaced by real impressions;
- AI referrals and query-panel observations;
- stale-content queue.

### Quarterly

- positioning and service fit;
- pillar performance;
- consolidation and retirement;
- crawler-policy revalidation;
- experiment keep/remove decisions;
- owned-profile/entity consistency.

## 10. Test architecture

| Category | Focus |
|---|---|
| Unit | Schemas, route builders, visibility, evidence, freshness, metadata, JSON-LD |
| Integration | Collections, generated paths, sitemap, RSS, robots, redirects |
| Build contract | Exact files, canonicals, robots, structured data, assets |
| Content contract | Required sections, claims, dates, sources, relationships, hub gates |
| Browser | Keyboard, no-JS, reduced motion, reflow, console/network, links |
| Hosted | Redirect status, real 404, headers, production origin |
| External validation | Search Console, Bing, structured-data tools, feed validators |

## 11. Route and publication tests

### Route registry

Test path construction, canonical normalization, duplicate rejection, parents, nav ordering, gates, redirect loops/chains, file endpoints, and invalid slug handling.

### Visibility matrix

| Record | Route | Nav | Sitemap | RSS | Related | JSON-LD |
|---|---:|---:|---:|---:|---:|---:|
| draft | no | no | no | no | no | no |
| noindex | yes | normally no | no | no | no | page-only where appropriate |
| public | yes | when eligible | yes | when eligible | yes | yes |
| public with failed evidence | build fails | build fails | build fails | build fails | build fails | build fails |
| stale maintained research | warning/demotion or failure by policy | policy | policy | normally no | policy | accurate dates only |

## 12. Metadata and structured-data gates

Every generated HTML page must have:

- one title;
- one non-empty description;
- one canonical;
- correct robots directives;
- correct language;
- complete Open Graph basics;
- social image metadata only when an asset exists;
- article fields only on article-like pages;
- no placeholder origin;
- no conflicting robots tags.

Structured-data tests:

- valid JSON;
- no duplicate canonical node IDs;
- absolute expected URLs;
- parity with visible content;
- no private/draft references;
- correct date ordering;
- existing images;
- breadcrumb parity;
- representative pages validated externally before release.

## 13. Sitemap, robots, RSS, and redirect gates

### Sitemap

- valid XML;
- each public canonical exactly once;
- no draft/noindex/redirect URL;
- correct origin and dates;
- every hosted URL returns 200 and self-canonicalizes.

### Robots

- canonical sitemap line;
- no accidental global block for Googlebot/Bingbot;
- approved search crawler access;
- approved training crawler exclusions;
- correct group semantics;
- no private-path disclosure;
- current provider-documentation review dates.

### RSS

- valid XML and MIME type;
- public Insights only;
- absolute URLs and valid dates;
- escaped content;
- no confidential body/source notes;
- working auto-discovery.

### Redirects

- source was verified public;
- one hop;
- target 200;
- target self-canonical;
- no old internal links or sitemap entries;
- real hosted behavior tested, not only a local static server.

## 14. Content quality and accessibility gates

Automate rejection of placeholders, missing metadata, duplicate titles/descriptions, broken references, public claims without evidence, missing alt/rights fields, empty required sections, stale research without behavior, and invalid protocols.

Human review remains responsible for uniqueness, accuracy, buyer clarity, proof strength, tone, privacy, client disclosure, and whether the URL deserves indexing.

Preserve and extend the current browser matrix:

- 320px reflow;
- 360px mobile navigation;
- tablet/desktop;
- 200% zoom;
- keyboard order and visible focus;
- meaningful skip-link focus;
- reduced motion;
- no JavaScript;
- no console errors or unexpected network requests;
- figure, table, and alt-text behavior;
- screen-reader smoke when a supported reader is available.

## 15. Performance and release command

- Content and navigation render without client JavaScript.
- Third-party scripts require a measured purpose.
- Images have dimensions and appropriate formats.
- Font loading avoids invisible text and layout instability.
- Route-specific JavaScript has an explicit budget and test.
- Field Core Web Vitals matter more than chasing a synthetic score without traffic.

Target CI gate:

```bash
npm run check \
  && npm test \
  && npm run build \
  && npm run verify \
  && npm run validate:content \
  && npm run validate:structured-data
```

A hosted acceptance gate follows preview deployment and precedes production promotion.
