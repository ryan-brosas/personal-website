// Test-only Astro fixture (NOT a production page). Used by tests/policy.test.mjs
// to prove canonical/trailing-slash behavior in a real Astro build, since the
// root M1 build has no production HTML routes.
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://example.com",
  output: "static",
  trailingSlash: "always",
});
