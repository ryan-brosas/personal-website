// W3·T10 (JSON-LD entity graph) — verifies the structured-data kernel builds a
// correct JSON-LD `@graph` with stable `@id` anchors keyed off the EXPLICIT
// `site` origin (never an env fallback), describes ONLY visible content
// (INV-03: no WebPage/Article node for noindex/draft pages), and never leaks the
// placeholder origin into production output.
//
// Runs as pure Node (no Astro runtime). Imports the .ts file directly via the
// ESM-native TypeScript resolution that Astro/Vite and the Node runner provide.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it, test } from "node:test";
import { buildEntityGraph, serializeJsonLd } from "../src/lib/structured-data.ts";

const SITE = "https://ryanjosebrosas.dev";
const typeOf = (graph, type) => graph["@graph"].find((n) => n["@type"] === type);

test("JSON-LD serialization cannot terminate its script data block", () => {
  const unsafeName = "</script><script>alert(1)</script>";
  const serialized = serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": [{ "@type": "WebPage", name: unsafeName }],
  });

  assert.doesNotMatch(serialized, /<\/script/i);
  assert.match(serialized, /\\u003c\/script>/);
  assert.equal(JSON.parse(serialized)["@graph"][0].name, unsafeName);
});

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

  it("web application pages identify the checked live deployment", () => {
    const graph = buildEntityGraph({
      site: SITE,
      page: {
        routeId: "tools-slug",
        params: { slug: "resume-bot" },
        title: "Résumé Bot",
        description: "Ask about Ryan's work.",
        visibility: "public",
        kind: "web-application",
        externalUrl: "https://resume.ryanjosebrosas.dev/",
      },
    });
    const application = typeOf(graph, "WebApplication");
    const webPage = typeOf(graph, "WebPage");
    assert.ok(application, "web-application kind emits a WebApplication node");
    assert.equal(application["@id"], "https://ryanjosebrosas.dev/resources/tools/resume-bot/#application");
    assert.equal(application.url, "https://resume.ryanjosebrosas.dev/");
    assert.equal(application.creator["@id"], "https://ryanjosebrosas.dev/#person");
    assert.equal(webPage.mainEntity["@id"], application["@id"]);
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


test("built WebPage identity matches metadata and visible copy", () => {
  const dist = path.resolve(import.meta.dirname, "..", "dist");
  const htmlFiles = fs.readdirSync(dist, { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".html"));
  const decode = (value) => value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  let webPages = 0;

  for (const relativePath of htmlFiles) {
    const html = fs.readFileSync(path.join(dist, relativePath), "utf-8");
    const graphs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]));
    const webPage = graphs.flatMap((graph) => graph["@graph"] ?? [])
      .find((node) => node["@type"] === "WebPage");
    if (webPage === undefined) continue;
    webPages += 1;

    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
    const description = decode(
      html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "",
    );
    const body = decode(html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? "");
    assert.equal(webPage.name, title, `${relativePath} WebPage name matches title`);
    assert.equal(webPage.description, description, `${relativePath} description matches metadata`);
    assert.ok(body.includes(description), `${relativePath} description is visible copy`);
  }
  assert.ok(webPages > 0, "the build emits public WebPage nodes");
});

test("built Article identity matches visible headlines and bylines", () => {
  const dist = path.resolve(import.meta.dirname, "..", "dist");
  const htmlFiles = fs.readdirSync(dist, { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".html"));
  const visibleText = (value) => value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  let articles = 0;

  for (const relativePath of htmlFiles) {
    const html = fs.readFileSync(path.join(dist, relativePath), "utf-8");
    const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap((match) => JSON.parse(match[1])["@graph"] ?? []);
    const article = nodes.find((node) => node["@type"] === "Article");
    if (article === undefined) continue;
    articles += 1;

    const person = nodes.find((node) => node["@type"] === "Person");
    const heading = visibleText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
    const byline = visibleText(
      html.match(/<span class="byline__author">([\s\S]*?)<\/span>/)?.[1] ?? "",
    );
    const body = visibleText(html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? "");
    assert.equal(article.headline, heading, `${relativePath} headline matches H1`);
    assert.ok(body.includes(article.description), `${relativePath} description is visible`);
    assert.equal(byline, person.name, `${relativePath} byline matches Person`);
    assert.equal(article.author["@id"], person["@id"], `${relativePath} author resolves to Person`);
  }
  assert.ok(articles > 0, "the build emits public Article nodes");
});

test("built WebApplication identity matches visible copy and launch links", () => {
  const dist = path.resolve(import.meta.dirname, "..", "dist");
  const tools = ["llm-watcher", "resume-bot"];

  for (const slug of tools) {
    const html = fs.readFileSync(
      path.join(dist, "resources", "tools", slug, "index.html"),
      "utf-8",
    );
    const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap((match) => JSON.parse(match[1])["@graph"] ?? []);
    const application = nodes.find((node) => node["@type"] === "WebApplication");
    const webPage = nodes.find((node) => node["@type"] === "WebPage");
    const person = nodes.find((node) => node["@type"] === "Person");
    const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, " ").trim();
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]
      .replaceAll("&#39;", "'");

    assert.ok(application, `${slug} emits a WebApplication node`);
    assert.equal(application.name, heading, `${slug} application name matches H1`);
    assert.equal(application.description, description, `${slug} description matches metadata`);
    assert.ok(html.includes(`href="${application.url}"`), `${slug} application URL is visible`);
    assert.equal(application.creator["@id"], person["@id"], `${slug} creator resolves to Person`);
    assert.equal(webPage.mainEntity["@id"], application["@id"], `${slug} WebPage links its app`);
  }
});

test("built Service identity matches visible copy and provider", () => {
  const dist = path.resolve(import.meta.dirname, "..", "dist");
  const htmlFiles = fs.readdirSync(dist, { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".html"));
  const visibleText = (value) => value
    .replaceAll("&amp;", "&")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  let services = 0;

  for (const relativePath of htmlFiles) {
    const html = fs.readFileSync(path.join(dist, relativePath), "utf-8");
    const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap((match) => JSON.parse(match[1])["@graph"] ?? []);
    const service = nodes.find((node) => node["@type"] === "Service");
    if (service === undefined) continue;
    services += 1;

    const person = nodes.find((node) => node["@type"] === "Person");
    const heading = visibleText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
    const body = visibleText(html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? "");
    assert.equal(service.name, heading, `${relativePath} service name matches H1`);
    assert.ok(body.includes(service.description), `${relativePath} description is visible`);
    assert.equal(service.provider["@id"], person["@id"], `${relativePath} provider resolves to Person`);
  }
  assert.ok(services > 0, "the build emits a public Service node");
});
