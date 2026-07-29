// Crawler policy: the single
// code-owned source of AI-crawler user-agent directives for /robots.txt.
// Consumed by src/lib/discovery.ts (renderRobots) via src/pages/robots.txt.ts.
// Pure data; no astro:* imports; Node-importable by tests.
//
// Search-crawl permission and model-training
// consent are DISTINCT decisions and MUST NOT be conflated. Search crawlers
// (retrieval/answer engines) are Allowed; training crawlers (dataset
// collection) are Disallowed. A bot never appears in both groups.
//
// The wildcard `User-agent: *` block is owned by renderRobots and is never
// listed here — it must never carry a Disallow (noindex pages stay crawlable,
// drafts have no route).

export type CrawlerPolicy = {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
};

// Deterministic order (search group first, then training) so robots.txt output
// is stable and the discovery tests are not flaky.
export const CRAWLER_POLICY: CrawlerPolicy[] = [
  // Search / retrieval crawlers — permitted to fetch for answer engines.
  { userAgent: "OAI-SearchBot", allow: ["/"] },
  { userAgent: "Claude-SearchBot", allow: ["/"] },
  { userAgent: "PerplexityBot", allow: ["/"] },
  // Model-training crawlers — training consent withheld (separate from search).
  { userAgent: "GPTBot", disallow: ["/"] },
  { userAgent: "ClaudeBot", disallow: ["/"] },
  { userAgent: "Google-Extended", disallow: ["/"] },
];
