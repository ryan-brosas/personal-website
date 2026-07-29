import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const workflowPath = path.join(repoRoot, ".github", "workflows", "ci.yml");

test("GitHub verifies pull requests and main before deployment", () => {
  assert.ok(fs.existsSync(workflowPath), ".github/workflows/ci.yml must exist");
  const workflow = fs.readFileSync(workflowPath, "utf-8");
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:\s*\n\s+branches:\s*\[main\]/);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s+read/);
  assert.match(workflow, /actions\/checkout@v4/);
  assert.match(workflow, /actions\/setup-node@v4/);
  const commands = ["npm ci", "npm run check", "npm run build", "npm test", "npm run verify"];
  const positions = commands.map((command) => {
    const position = workflow.indexOf(`run: ${command}`);
    assert.ok(position >= 0, `CI runs ${command}`);
    return position;
  });
  assert.deepEqual(
    positions,
    positions.toSorted((a, b) => a - b),
    "CI builds before suites that inspect dist/",
  );
});

test("verified main builds deploy atomically to the production VPS", () => {
  const workflow = fs.readFileSync(workflowPath, "utf-8");
  assert.match(workflow, /SITE_ORIGIN:\s+https:\/\/ryanjosebrosas\.dev/);
  assert.match(workflow, /PRODUCTION_BUILD:\s+"true"/);
  assert.match(
    workflow,
    /name: Verify build output\s+env:\s+SITE_ORIGIN: https:\/\/ryanjosebrosas\.dev\s+run: npm run verify/,
  );
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /actions\/download-artifact@v4/);
  assert.match(workflow, /environment:\s+production/);
  for (const secret of ["DEPLOY_HOST", "DEPLOY_USER", "DEPLOY_SSH_KEY", "DEPLOY_KNOWN_HOSTS"]) {
    assert.ok(workflow.includes(`secrets.${secret}`), `deployment reads ${secret} from GitHub secrets`);
  }
  assert.match(workflow, /\/srv\/personal-website\/releases\/\$\{GITHUB_SHA\}/);
  assert.match(workflow, /mv -Tf/);

  const caddyPath = path.join(repoRoot, "ops", "Caddyfile");
  assert.ok(fs.existsSync(caddyPath), "ops/Caddyfile must exist");
  const caddy = fs.readFileSync(caddyPath, "utf-8");
  assert.match(caddy, /^ryanjosebrosas\.dev \{/m);
  assert.match(caddy, /^www\.ryanjosebrosas\.dev \{/m);
  assert.match(caddy, /root \* \/srv\/personal-website\/current/);
  assert.match(caddy, /file_server/);
  assert.match(caddy, /Strict-Transport-Security "max-age=31536000; includeSubDomains"/);
  assert.match(caddy, /Permissions-Policy "camera=\(\), microphone=\(\), geolocation=\(\), payment=\(\), usb=\(\)"/);

  const distDir = path.join(repoRoot, "dist");
  const behavioralHashes = new Set();
  for (const relativePath of fs.readdirSync(distDir, { recursive: true })) {
    if (typeof relativePath !== "string" || !relativePath.endsWith(".html")) continue;
    const html = fs.readFileSync(path.join(distDir, relativePath), "utf-8");
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/type=["']application\/ld\+json["']/i.test(match[1])) continue;
      behavioralHashes.add(`sha256-${createHash("sha256").update(match[2]).digest("base64")}`);
    }
  }
  assert.equal(behavioralHashes.size, 1, "all pages share one behavioral inline script");
  const [behavioralHash] = behavioralHashes;
  for (const directive of [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    `script-src 'self' '${behavioralHash}'`,
    "style-src 'self'",
    "upgrade-insecure-requests",
  ]) {
    assert.ok(caddy.includes(directive), `CSP includes ${directive}`);
  }
});
