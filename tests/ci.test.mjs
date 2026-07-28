import assert from "node:assert/strict";
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
  for (const command of ["npm ci", "npm run check", "npm test", "npm run build", "npm run verify"]) {
    assert.ok(workflow.includes(`run: ${command}`), `CI runs ${command}`);
  }
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
});
