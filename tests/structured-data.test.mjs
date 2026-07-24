// W3·T10 (JSON-LD entity graph) — verifies the structured-data kernel builds a
// correct JSON-LD `@graph` with stable `@id` anchors keyed off the EXPLICIT
// `site` origin (never an env fallback), describes ONLY visible content
// (INV-03: no WebPage/Article node for noindex/draft pages), and never leaks the
// placeholder origin into production output.
//
// Runs as pure Node (no Astro runtime). Imports the .ts file directly via the
// ESM-native TypeScript resolution that Astro/Vite and the Node runner provide.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildEntityGraph } from "../src/lib/structured-data.ts";

const SITE = "https://ryanjosebrosas.dev";
const typeOf = (graph, type) => graph["@graph"].find((n) => n["@type"] === type);

describe("structured-data — buildEntityGraph", () => {
  it("wraps nodes in a schema.org @graph envelope", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: { routeId: "about", title: "About", description: "d", visibility: "public" },
    });
    assert.equal(graph["@context"], "https://schema.org");
    assert.ok(Array.isArray(graph["@graph"]), "@graph is an array");
  });

  it("Person @id is keyed off the explicit site origin (not env)", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: { routeId: "about", title: "About", description: "d", visibility: "public" },
    });
    const person = typeOf(graph, "Person");
    assert.ok(person, "graph must include a Person node");
    assert.equal(person["@id"], "https://ryanjosebrosas.dev/#person");
    assert.equal(person.name, "Ryan Brosas");
    assert.ok(Array.isArray(person.sameAs), "Person.sameAs is an array of URLs");
    assert.ok(person.knowsAbout.length > 0, "Person.knowsAbout is populated from topic pillars");
  });

  it("WebSite @id is keyed off the explicit site origin and publishes the Person", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: { routeId: "about", title: "About", description: "d", visibility: "public" },
    });
    const website = typeOf(graph, "WebSite");
    assert.ok(website, "graph must include a WebSite node");
    assert.equal(website["@id"], "https://ryanjosebrosas.dev/#website");
    assert.equal(website.publisher["@id"], "https://ryanjosebrosas.dev/#person");
  });

  it("never contains the placeholder origin when site is passed explicitly", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: { routeId: "about", title: "About", description: "About Ryan", visibility: "public" },
    });
    const json = JSON.stringify(graph);
    assert.ok(!json.includes("example.com"), `graph must not contain example.com — got: ${json}`);
  });

  it("public page emits a WebPage node with a canonical #webpage anchor", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: { routeId: "about", title: "About", description: "d", visibility: "public" },
    });
    const webPage = typeOf(graph, "WebPage");
    assert.ok(webPage, "public page must include a WebPage node");
    assert.equal(webPage["@id"], "https://ryanjosebrosas.dev/about/#webpage");
    assert.equal(webPage.url, "https://ryanjosebrosas.dev/about/");
    assert.equal(webPage.name, "About");
  });

  it("public page with breadcrumbs emits a BreadcrumbList of the registry trail", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: { routeId: "about", title: "About", description: "d", visibility: "public" },
    });
    const crumbs = typeOf(graph, "BreadcrumbList");
    assert.ok(crumbs, "public page with a trail must include a BreadcrumbList");
    assert.ok(crumbs.itemListElement.length >= 1, "BreadcrumbList has at least one item");
    assert.equal(crumbs.itemListElement[0].position, 1);
  });

  it("service page kind emits a Service node", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: {
        routeId: "services",
        title: "Services",
        description: "d",
        visibility: "public",
        kind: "service",
      },
    });
    assert.ok(typeOf(graph, "Service"), "service-kind page must include a Service node");
  });

  it("INV-03: a noindex page emits NO WebPage node (still keeps site identity)", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: { routeId: "about", title: "About", description: "d", visibility: "noindex" },
    });
    assert.equal(typeOf(graph, "WebPage"), undefined, "noindex page must not emit a WebPage node");
    assert.equal(
      typeOf(graph, "BreadcrumbList"),
      undefined,
      "noindex page must not emit a BreadcrumbList",
    );
    // Site identity (Person/WebSite) is global and still present.
    assert.ok(typeOf(graph, "Person"), "Person node is site identity — always present");
    assert.ok(typeOf(graph, "WebSite"), "WebSite node is site identity — always present");
  });

  it("INV-03: a draft page emits NO WebPage node", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: { routeId: "about", title: "About", description: "d", visibility: "draft" },
    });
    assert.equal(typeOf(graph, "WebPage"), undefined, "draft page must not emit a WebPage node");
  });

  it("tolerates a trailing slash on the passed site origin", () => {
    const graph = buildEntityGraph({
      site: "https://ryanjosebrosas.dev/",
      page: { routeId: "about", title: "About", description: "d", visibility: "public" },
    });
    assert.equal(typeOf(graph, "Person")["@id"], "https://ryanjosebrosas.dev/#person");
    assert.ok(!JSON.stringify(graph).includes("//#"), "no double-slash before the #anchor");
  });
});
