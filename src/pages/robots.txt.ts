// M1 (Plan 01) — thin endpoint wrapper for /robots.txt.
// Renders from the configured origin via the pure renderRobots function.
import type { APIRoute } from "astro";
import { renderRobots } from "../lib/discovery.ts";

export const GET: APIRoute = ({ site }) => {
  const siteHref = site?.href ?? "https://example.com";
  return new Response(renderRobots(siteHref), {
    headers: { "Content-Type": "text/plain" },
  });
};
