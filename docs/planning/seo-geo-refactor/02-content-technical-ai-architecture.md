# Chapter 3: Content Models, Technical Architecture, Structured Data, Discovery, and AI Search

> Part of [Plan for the Personal Website SEO, Entity, and AI-Search Refactor](../PLAN_FOR_PERSONAL_WEBSITE_SEO_GEO_REFACTOR.md). Research baseline: 2026-07-24; repository baseline: `ad151469db0bab9c5a8c8140680ab5b78d6cbb0c`.

---

## 1. Data-model principles

Use shared publication primitives, then purpose-specific schemas. Service, case-study, insight, and research records have different obligations and should not be reduced to one permissive generic record.

### Shared publication model

```ts
export type Visibility = "draft" | "public" | "noindex";

export interface PublicationDates {
  publishedAt?: string; // first public publication; immutable afterward
  modifiedAt?: string;  // substantive visible change
  reviewedAt?: string;  // accuracy review
  expiresAt?: string;   // freshness gate for maintained research
}

export interface PublicationRecord {
  visibility: Visibility;
  dates: PublicationDates;
  owner: "ryan";
  reviewStatus: "unreviewed" | "reviewed" | "stale";
}
```

Validation:

- `public` requires `publishedAt`.
- `modifiedAt` cannot precede `publishedAt`.
- Formatting-only commits do not manufacture freshness.
- `expiresAt` triggers workflow behavior; it is not a search-ranking claim.

### SEO fields

```ts
export interface SeoFields {
  title: string;
  description: string;
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: AssetRef;
  socialImageAlt?: string;
  robots?: {
    index: boolean;
    follow: boolean;
    maxImagePreview?: "none" | "standard" | "large";
    maxSnippet?: number;
    maxVideoPreview?: number;
  };
  canonicalOverride?: string;
}
```

`canonicalOverride` is exceptional, code-allowlisted, and normally unavailable to editors.

## 2. Entity, source, and claim records

### Canonical person entity

```ts
export interface PersonEntity {
  id: "ryan-brosas";
  name: "Ryan Brosas";
  fullName: string;
  alternateNames: string[];
  role: string;
  summary: string;
  location: {
    countryCode: "PH";
    region?: string;
    remote: true;
  };
  sameAs: VerifiedExternalProfile[];
  knowsAbout: string[];
  image?: AssetRef;
}
```

Never infer `sameAs` from a name match. Every external identity must be owner-verified.

### Source record

```ts
export interface SourceRecord {
  id: string;
  title: string;
  type:
    | "public-url"
    | "approved-artifact"
    | "measurement-export"
    | "testimonial-approval"
    | "operator-observation";
  publicUrl?: string;
  publicSafePath?: string;
  owner: string;
  permission: "public" | "redacted" | "internal-only";
  capturedAt?: string;
  reviewedAt: string;
  notes?: string;
}
```

### Claim record

```ts
export interface ClaimRecord {
  id: string;
  statement: string;
  kind: "fact" | "metric" | "testimonial" | "interpretation" | "proposal";
  sourceIds: string[];
  disclosure?: string;
  validFrom?: string;
  validThrough?: string;
  status: "approved" | "blocked" | "retired";
}
```

Rules:

- A public metric requires a public or redacted approved source.
- A testimonial requires text and identity/use approval.
- Interpretations must not masquerade as measured facts.
- Retired claims cannot render publicly.
- Internal-only sources may validate drafts but never leak paths or links.

## 3. Purpose-specific schemas

### Service

Required fields: slug, SEO, promise, audiences, problems, outcomes, deliverables, process, non-fit conditions, proof references, approved claim IDs, CTA.

A standalone service detail page also requires distinct intent and relevant public proof.

### Case study

Required fields:

- named, anonymized, or self-project disclosure mode;
- challenge and baseline where known;
- constraints and risk;
- Ryan's role;
- architecture/process summary;
- decisions and trade-offs;
- verification and failure handling;
- outcome summary;
- claim IDs;
- limitations;
- approved artifacts;
- linked services.

Observed results must be separated from attributed business outcomes.

### Insight

Required fields:

- author and optional reviewers;
- topic pillar, intent, audience;
- direct answer;
- key takeaways;
- method: first-hand, analysis, research synthesis, or tutorial;
- source IDs;
- dates and correction note;
- curated relationships.

A keyword match is not a publication reason. Each article needs a credible author advantage.

### Research

Required fields:

- research question;
- methodology;
- scope and exclusions;
- source set;
- cutoff date;
- review cadence;
- stale-after interval;
- disclosure;
- limitations;
- change log.

### Assets

Every public image or downloadable artifact records path, alt text, dimensions where known, MIME type, rights, optional source, and focal point. Decorative assets are explicitly marked; alt text is not generated from filenames.

## 4. Relationships and topics

Use typed `{ collection, id }` references.

- Public curation can point only to public records.
- Draft references may exist in drafts but cannot leak at build time.
- Missing references fail the build.
- Related content is curated first; deterministic topic fallback is optional.
- Topic fields support planning/internal links but do not auto-create public taxonomy pages.

Initial topic pillars:

1. AI workflow systems.
2. Agent reliability and evaluation.
3. Content and research operations.
4. Context and knowledge systems, after proof exists.

## 5. Target source architecture

```text
src/
├── config/
│   ├── site.ts
│   ├── entities.ts
│   ├── crawlers.ts
│   └── routes.ts
├── content/
│   ├── pages/
│   ├── services/
│   ├── case-studies/
│   ├── insights/
│   ├── research/
│   ├── sources/
│   ├── claims/
│   └── settings/
├── lib/
│   ├── publishing.ts
│   ├── content-schemas.ts
│   ├── route-registry.ts
│   ├── discovery.ts
│   ├── metadata.ts
│   ├── structured-data.ts
│   ├── breadcrumbs.ts
│   ├── relationships.ts
│   ├── evidence.ts
│   └── freshness.ts
├── components/
│   ├── SeoHead.astro
│   ├── JsonLd.astro
│   ├── Breadcrumbs.astro
│   ├── EvidenceNote.astro
│   ├── Byline.astro
│   ├── FreshnessNotice.astro
│   └── RelatedContent.astro
├── layouts/
│   ├── BaseLayout.astro
│   ├── CommercialLayout.astro
│   ├── CaseStudyLayout.astro
│   ├── ArticleLayout.astro
│   └── ResearchLayout.astro
└── pages/
    ├── index.astro
    ├── services/
    ├── case-studies/
    ├── insights/
    ├── research/
    ├── sitemap.xml.ts
    ├── robots.txt.ts
    ├── rss.xml.ts
    └── llms.txt.ts          # experiment only
```

## 6. One typed route registry

The registry is the executable sitemap and URL policy.

```ts
export const ROUTE_REGISTRY = defineRoutes({
  home: {
    kind: "singleton",
    pattern: "/",
    gate: "home-proof",
  },
  services: {
    kind: "singleton",
    pattern: "/services/",
    nav: { placement: "primary", order: 10, label: "Services" },
  },
  caseStudiesIndex: {
    kind: "hub",
    pattern: "/case-studies/",
    gate: "case-studies-hub",
    nav: { placement: "primary", order: 20, label: "Case Studies" },
  },
  caseStudy: {
    kind: "collection",
    pattern: "/case-studies/:slug/",
    collection: "caseStudies",
    parent: "caseStudiesIndex",
  },
  insightsIndex: {
    kind: "hub",
    pattern: "/insights/",
    gate: "insights-hub",
    nav: { placement: "primary", order: 30, label: "Insights" },
  },
  insight: {
    kind: "collection",
    pattern: "/insights/:slug/",
    collection: "insights",
    parent: "insightsIndex",
  },
  about: {
    kind: "singleton",
    pattern: "/about/",
    nav: { placement: "primary", order: 40, label: "About" },
  },
  contact: {
    kind: "singleton",
    pattern: "/contact/",
    nav: { placement: "primary", order: 50, label: "Contact", emphasis: true },
  },
});
```

Derived outputs:

```ts
pathFor(routeId, params)
canonicalFor(routeId, params, origin)
parentFor(routeId)
navItems(snapshot)
breadcrumbsFor(routeId, record)
discoverableRoutes(snapshot)
redirectManifest()
expectedBuildManifest(snapshot)
```

Validation fails on duplicate IDs/paths, malformed patterns, wrong slash behavior, missing parents, invalid gates, redirect loops/chains, and collection routes without schema mappings.

## 7. Origin and metadata

Production builds require an explicit approved origin and fail on placeholder domains.

All templates call one metadata builder that returns title, description, canonical, robots, Open Graph, X/Twitter, article fields, feed links, JSON-LD, and breadcrumbs.

Suggested titles:

```text
Home:       AI Workflow Systems for Founder-Led Teams | Ryan Brosas
Service:    {Service Name} | Ryan Brosas
Case study: {Case Study Title} | Ryan Brosas
Insight:    {Article Title} | Ryan Brosas
About:      About Ryan Brosas, Agent Systems Builder
Contact:    Contact Ryan Brosas
```

Social images require existing public-safe assets, dimensions, and alt text. Do not add a generated-image endpoint until social-preview production becomes a demonstrated bottleneck.

## 8. Structured-data graph

Use JSON-LD to disambiguate visible content, not to manufacture eligibility.

Stable IDs:

```text
https://{origin}/#website
https://{origin}/#person
https://{origin}/{path}/#webpage
https://{origin}/{path}/#article
https://{origin}/{path}/#breadcrumb
```

Recommended types:

- Home: `Person`, `WebSite`, `WebPage`.
- About: canonical `Person`; `ProfilePage` only when current guidance and visible content support it.
- Services: `Service` with truthful provider and service type.
- Insights: `Article` with author and accurate dates.
- Case studies: conservative `Article` or `CreativeWork`.
- Research: `Article`, `Dataset`, or `CreativeWork` only when the asset truly fits.
- Detail pages: matching visible `BreadcrumbList`.

Do not add fabricated Organization, ratings, prices, geography, or unsupported rich-result markup. One canonical Person node must be reused across pages.

## 9. Discovery architecture

### XML sitemap

- Absolute canonical public URLs only.
- Accurate `lastmod` from substantive publication/modification data.
- No drafts, noindex, redirects, 404s, feeds, robots, or experiments.
- Deterministic sorting and uniqueness.
- No `priority` or `changefreq` without an operational reason.

Discovery parity invariant:

```text
public canonical routes
  == sitemap URLs
  == eligible internal discovery inventory
  == verifier expectedDiscoverableRoutes
```

### RSS

Launch with Insights. Include public entries only, absolute URLs, valid dates, excerpt-only content by default, correct MIME type, XML escaping, and feed auto-discovery.

### IndexNow

After a successful production deploy, notify only URLs that were added, materially updated, redirected, or deleted. Log the deployed commit, URL set, request, and response. Treat the protocol as change notification, not an indexing guarantee.

## 10. AI search and GEO strategy

### Working definitions

- **SEO:** technical and content eligibility for discovery and search.
- **AEO:** direct, well-scoped answers as a content-design lens.
- **GEO:** attempts to improve inclusion, attribution, or visibility in generative answers.
- **AI-search accessibility:** selected systems can crawl, retrieve, understand, attribute, and cite public pages.

### Research conclusion

Conventional SEO remains the base. Google states that its AI search features have no separate technical or special-schema requirement; indexability, snippet eligibility, internal linking, textual content, page quality, and visible structured-data parity remain central.

The original GEO benchmark found that source citation and authoritative presentation could improve visibility in a controlled setting, with effects varying by domain. Do not turn its “up to 40%” result into a site-level promise.

A July 2026 critical survey further warns that evidence is strongest for changing how content is used **after it has already been retrieved**. Stable cross-platform effects on organic discoverability, citations, traffic, and business outcomes remain unproven. Therefore treat AI visibility as a stochastic, multi-stage measurement problem—not a checklist or proprietary score.

### Citation-ready page model

```text
Discoverable
+ directly answers a scoped question
+ identifies author/entity
+ exposes dates and freshness
+ separates fact from interpretation
+ links to primary evidence
+ uses stable URLs and headings
+ contains self-contained passages
+ acknowledges limits
```

Useful page practices:

- concise direct answer near the start;
- descriptive subquestion headings;
- definitions before nuance;
- key takeaways;
- explicit steps, criteria, comparisons, and tables;
- methodology and sources;
- visible author/review dates;
- first-hand examples;
- failure cases and limitations;
- stable section anchors;
- semantic figures, tables, and citations.

Do not mechanically convert every heading into a question or duplicate answers.

## 11. Crawler policy

Recommended owner default:

### Allow search/retrieval crawlers

- Googlebot
- Bingbot
- OAI-SearchBot
- Claude-SearchBot
- PerplexityBot

### Disallow model-training/broader model-use tokens pending explicit consent

- GPTBot
- ClaudeBot
- Google-Extended

This separation is intentional. OpenAI, Anthropic, Perplexity, and Google document distinct search/retrieval and training/model-use controls.

User-triggered agents such as ChatGPT-User, Claude-User, and Perplexity-User may not behave like automatic crawlers; robots.txt may not be an absolute control for a user-requested fetch. Document that limitation.

Store crawler policy in typed configuration with provider, token, purpose, decision, source URL, reviewed date, next review date, and owner. Fail or warn when documentation review is overdue.

Example policy:

```txt
User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: https://approved-origin.example/sitemap.xml
```

Revalidate all tokens immediately before implementation and major releases.

## 12. `llms.txt` policy

Treat `llms.txt` as an optional proposal, not:

- access control;
- a robots or sitemap replacement;
- a Google AI requirement;
- proof that any provider consumes it;
- a ranking guarantee.

Experiment only after the commercial core and at least one authority section are public. Generate a concise map from the route registry, include only public canonical URLs, avoid duplicated full bodies, record a hypothesis and observation window, and keep/remove it based on logs, referrals, citations, and regressions. Do not publish `llms-full.txt` initially.

## 13. AI-assisted editorial policy

AI may assist with outlines, clustering, source organization, transcription, consistency checks, code, and testing. AI may not independently approve claims, metrics, testimonials, client disclosures, source interpretations, current crawler/product facts, or publication status. Every public page has a human owner and a reason to exist beyond traffic acquisition.
