import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const html = fs.readFileSync(
  path.join(path.resolve(import.meta.dirname, ".."), "dist", "index.html"),
  "utf-8",
);

test("the homepage says what a visitor receives", () => {
  assert.match(html, /class="dual-list"/);
  assert.match(html, /What you get/i);
});

test("the homepage lets a visitor self-qualify", () => {
  assert.match(html, /Who it(?:'|&#39;|&#8217;|\u2019)s for/i);
});

test("the qualification copy comes from the service page, not invented claims", () => {
  const services = fs.readFileSync(
    path.join(path.resolve(import.meta.dirname, ".."), "src", "content", "pages", "services.md"),
    "utf-8",
  );
  // Each fit bullet on the homepage must exist in the authored service content.
  for (const bullet of [
    "The same task eats your attention every week",
    "Key facts are scattered, so someone rebuilds them each time",
    "Your automation handles the easy path but leaves you cleaning up",
  ]) {
    assert.ok(services.includes(bullet), `service page authors: ${bullet}`);
    assert.ok(html.includes(bullet), `homepage reuses: ${bullet}`);
  }
});
