// Production origin guard (INV-12), kept pure so
// the "real production build" rejection is Node-testable without spawning astro.
//
// Vite forces NODE_ENV=production in EVERY build (including `astro check` and the
// `node --test` runner), so NODE_ENV cannot distinguish a real release build from
// dev/test. A dedicated `PRODUCTION_BUILD=true` env var is the explicit production
// signal instead. astro.config.mjs calls this with `process.env`.
//
// Rules:
//   • PRODUCTION_BUILD=true  → SITE_ORIGIN MUST be a real origin: THROW when it is
//     absent OR equals the placeholder.
//   • otherwise (dev/test/preview/`astro check`) → absent SITE_ORIGIN silently
//     falls back to the placeholder, but an EXPLICIT placeholder value still throws
//     (catches the operator copy-pasting the placeholder into a CI/CD env var).

export const PLACEHOLDER_ORIGIN = "https://example.com";

export interface SiteOriginEnv {
  readonly SITE_ORIGIN?: string;
  readonly PRODUCTION_BUILD?: string;
}

export const resolveSiteOrigin = (env: SiteOriginEnv): string => {
  const origin = env.SITE_ORIGIN ?? PLACEHOLDER_ORIGIN;

  if (env.PRODUCTION_BUILD === "true") {
    if (env.SITE_ORIGIN === undefined || env.SITE_ORIGIN === PLACEHOLDER_ORIGIN) {
      throw new Error(
        "SITE_ORIGIN must be a real origin in a production build (PRODUCTION_BUILD=true), " +
          "e.g. SITE_ORIGIN=https://ryanjosebrosas.dev PRODUCTION_BUILD=true npm run build",
      );
    }
    return origin;
  }

  if (env.SITE_ORIGIN === PLACEHOLDER_ORIGIN) {
    throw new Error(
      "SITE_ORIGIN must not be the placeholder value in production (e.g. SITE_ORIGIN=https://ryanjosebrosas.dev npm run build)",
    );
  }

  return origin;
};
