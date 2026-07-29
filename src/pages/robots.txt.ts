// Renders /robots.txt from the configured origin and code-owned crawler policy.
import type { APIRoute } from "astro";
import { renderRobots } from "../lib/discovery.ts";
import { CRAWLER_POLICY } from "../config/crawlers.ts";

export const GET: APIRoute = ({ site }) => {
  const siteHref = site?.href ?? "https://example.com";
  return new Response(renderRobots(siteHref, CRAWLER_POLICY), {
    headers: { "Content-Type": "text/plain" },
  });
};
