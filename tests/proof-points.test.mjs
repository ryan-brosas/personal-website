import assert from "node:assert/strict";
import test from "node:test";
import { selectPublicProofPoints } from "../src/lib/proof-points.ts";

const SOURCES = {
  "source-public": {
    id: "source-public",
    title: "A public-safe artifact",
    type: "approved-artifact",
    owner: "ryan",
    permission: "public",
    reviewedAt: "2026-07-25T00:00:00.000Z",
  },
  "source-internal": {
    id: "source-internal",
    title: "An internal record",
    type: "approved-artifact",
    owner: "ryan",
    permission: "internal-only",
    reviewedAt: "2026-07-25T00:00:00.000Z",
  },
};

const point = (over) => ({
  id: "p",
  value: "12",
  label: "Systems",
  detail: "Shipped end to end.",
  sourceId: "source-public",
  status: "approved",
  order: 1,
  ...over,
});

test("an approved point backed by a public source renders", () => {
  const kept = selectPublicProofPoints([point()], SOURCES);
  assert.equal(kept.length, 1);
  assert.equal(kept[0].value, "12");
});

test("a point backed by an internal-only source is withheld", () => {
  assert.deepEqual(selectPublicProofPoints([point({ sourceId: "source-internal" })], SOURCES), []);
});

test("a point whose source is not registered is withheld", () => {
  assert.deepEqual(selectPublicProofPoints([point({ sourceId: "source-ghost" })], SOURCES), []);
});

test("a blocked point is withheld even with a good source", () => {
  assert.deepEqual(selectPublicProofPoints([point({ status: "blocked" })], SOURCES), []);
});

test("a retired point is withheld even with a good source", () => {
  assert.deepEqual(selectPublicProofPoints([point({ status: "retired" })], SOURCES), []);
});

test("points render in their declared order", () => {
  const kept = selectPublicProofPoints(
    [point({ id: "b", order: 2, value: "B" }), point({ id: "a", order: 1, value: "A" })],
    SOURCES,
  );
  assert.deepEqual(kept.map((p) => p.value), ["A", "B"]);
});

test("no entries yields no strip rather than an empty shell", () => {
  assert.deepEqual(selectPublicProofPoints([], SOURCES), []);
});

test("the homepage renders the shared strip only when points survive the gate", async () => {
  const fs = await import("node:fs");
  const home = fs.readFileSync(new URL("../src/pages/index.astro", import.meta.url), "utf-8");
  const componentPath = new URL("../src/components/ProofStrip.astro", import.meta.url);
  assert.equal(fs.existsSync(componentPath), true);
  const component = fs.readFileSync(componentPath, "utf-8");
  assert.match(home, /proofPoints\.length > 0 &&/);
  assert.match(home, /import ProofStrip/);
  assert.match(home, /<ProofStrip items=\{proofPoints\}/);
  assert.doesNotMatch(home, /<ul class="proof-strip"/);
  assert.match(component, /<ul class="proof-strip"/);
});
