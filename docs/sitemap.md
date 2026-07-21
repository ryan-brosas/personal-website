# Sitemap & Information Architecture

> SEO- **and AI-search**-focused personal website on **Astro** (+ semantic HTML/CSS).
> Design goal: **flexible** — new sections (directories, tools, etc.) plug in
> without re-architecting. Every section = a Content Collection + a route template.

## Core principle

Three repeatable building blocks. Everything on the site is one of these:

1. **Hub** — an index/listing page for a section (`/blog/`, `/directories/`).
2. **Entry** — a detail page (`/blog/[slug]/`, `/directories/[dir]/[entry]/`).
3. **Taxonomy** — cross-cutting grouping (`/tags/[tag]/`).

Add a new section by: (a) defining a collection schema, (b) copying a hub +
entry route template. No layout or SEO plumbing changes.

## Locked decisions

- **Trailing slashes: always.** One canonical form everywhere → no duplicate-content splits.
- **Directory entries:** detail pages supported but optional (thin entries can stay
  as rows on the directory hub).
- **Tools: static-first.** `llm-watcher` and future tools render statically; add an
  SSR adapter (Node/Cloudflare/Vercel) *only* if a specific tool needs live data/an API.

## URL map

```
/                              Home
/about/                        About (Person schema anchor)
/now/                          Optional "now" page
/contact/

# Writing
/blog/                         Blog hub (paginated)
/blog/[slug]/                  Post
/tags/[tag]/                   Cross-content tag pages
/rss.xml                       Feed

# Work
/projects/                     Projects hub
/projects/[slug]/              Project detail

# Directories (curated listings — high-SEO)
/directories/                  Index of all directories
/directories/[dir]/            One directory (e.g. /directories/ai-tools/)
/directories/[dir]/[entry]/    Entry detail (optional)

# Tools / apps (home for llm-watcher + future apps)
/tools/                        Tools hub
/tools/[slug]/                 A tool's page
/tools/llm-watcher/

# SEO / machine-readable
/sitemap-index.xml             Auto (@astrojs/sitemap)
/robots.txt                    Static in public/ (allowlist below)
/llms.txt                      AI/LLM discoverability index
/llms-full.txt                 Full-content dump (optional)
/[page].md                     Per-page markdown twin (AI-clean text; optional)
/og/[...].png                  Generated OpenGraph images (optional)
```

## Content collections (`src/content/`)

| Collection | Type | Notes |
|---|---|---|
| `pages` | standalone | about, now, contact |
| `blog` | hub+entry | posts; tags, draft flag, publish date |
| `projects` | hub+entry | cards, projects, and promoted case studies at stable URLs |
| `directories` | hub | one file per directory (title, description, category) |
| `directoryEntries` | entry | `directory: <ref>` links back |
| `tools` | hub+entry | static-first apps like LLM Watcher |
| `tags` | taxonomy | controlled cross-content vocabulary and authored descriptions |

### Shared SEO frontmatter (base schema every collection extends)

```ts
{
  title: string,          // <title> + og:title
  description: string,    // meta description + og:description (150–160 chars)
  canonical?: string,
  draft?: boolean,        // no public route
  noindex?: boolean,      // rendered if needed; excluded from discovery outputs
  ogImage?: string,
  published?: Date,
  updated?: Date,         // substantive editorial change only
  featured?: boolean,
  tags?: string[],        // controlled references
  related?: string[],     // validated internal canonical paths
}
```

## SEO strategy (why Astro fits)

- **Zero-JS by default** supports performance, accessibility, and complete crawler-visible HTML.
- **Reusable `<Seo>` + `BaseLayout`**: canonical, OpenGraph, Twitter, robots meta in one place.
- **JSON-LD helpers:** `Person` + `WebSite` (site-wide), `Article` (blog),
  `SoftwareApplication` (tools), `ItemList` (directory hubs), `BreadcrumbList` (entries).
- **`@astrojs/sitemap`** → `sitemap-index.xml`; generated routes are included by default, so exclusions must be configured explicitly.

## AI search / GEO (open to AI answer engines)

Goal: be **crawlable, extractable, and citable** by AI search. Two levers — access
(robots) and structure (clean content + machine files).

### 1. Access — crawler policy

Generate an explicit `robots.txt` from the final site origin. Ordinary search access,
AI retrieval/search access, and model-training permission are separate decisions.

Launch policy baseline:

- Allow `Googlebot`, `Bingbot`, and validated ordinary search crawlers.
- Allow validated retrieval/search bots such as `OAI-SearchBot`,
  `Claude-SearchBot`, and `Claude-User` when AI-search visibility is desired.
- Decide training access independently for `GPTBot`, `ClaudeBot`,
  `Google-Extended`, and other provider-specific training bots.
- Do not rely on `robots.txt` for privacy or authorization. OpenAI documents
  `ChatGPT-User` as user-triggered and notes that robots rules may not apply.
- Revalidate every user-agent and provider policy immediately before launch.
- Include the final absolute `Sitemap:` URL; never deploy `EXAMPLE.com`.

Google documents that ordinary SEO requirements apply to AI Overviews and AI Mode;
there is no separate AI-file or schema requirement. `Googlebot` controls Search access,
while `Google-Extended` applies to training/grounding in other Google systems.

### 2. Structure — make content easy to extract & cite

- **Semantic HTML**, one `<h1>`, descriptive headings, answer-first paragraphs.
- **JSON-LD where accurate** — describe visible entities only; validity does not guarantee search presentation.
- **`llms.txt`** (optional experiment): curated index generated from public content.
  It is a community proposal, not a proven ranking or citation mechanism.
- **Per-page markdown twins** remain deferred until logs or a named consumer demonstrate value.
- **RSS + stable canonical URLs + `updated` dates** → freshness signals for retrieval.
- Fast, JS-free pages: AI crawlers that don't execute JS still get complete content.

## Extensibility checklist (adding a section later)

1. Add collection schema in `src/content.config.ts` (extend the shared schema).
2. Add `src/pages/<section>/index.astro` (hub) + `[slug].astro` (entry).
3. Wire the section into shared visibility, tags, sitemap filtering, SEO, and optional `llms.txt` generation.
4. Add `<section>/[facet]/[value].astro` only if it needs its own taxonomy.
