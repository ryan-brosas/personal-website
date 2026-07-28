// Reads the content fields needed by Node-side build tooling. Collection names
// come from the route registry so adding a routed collection updates the build
// manifest without another case-specific branch.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTE_REGISTRY } from "../src/config/routes.ts";
import {
  resolveCollectionDiscoveryRoutes,
  resolveCollectionEntryRoutes,
  resolveRoutes,
} from "../src/lib/site-routes.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(HERE, "..");
const CONTENT_ROOT = path.join(REPO_ROOT, "src", "content");
const PAGES_DIR = path.join(CONTENT_ROOT, "pages");
const CASE_STUDIES_COLLECTION = "case-studies";

const collectionNames = () =>
  [...new Set(
    ROUTE_REGISTRY.all()
      .filter((route) => route.isDynamic === true && route.collection !== undefined)
      .map((route) => route.collection),
  )].sort();

const frontmatterValue = (block, key) => {
  const match = block.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m"));
  return match ? match[1].trim() : undefined;
};

const readRecords = (dir, ignoredDirectories = new Set()) => {
  if (!fs.existsSync(dir)) return [];
  const records = [];
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entryPath)) {
        records.push(...readRecords(entryPath, ignoredDirectories));
      }
      continue;
    }
    if (!entry.name.endsWith(".md")) continue;
    const raw = fs.readFileSync(entryPath, "utf-8");
    const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatter) continue;
    records.push({
      slug: frontmatterValue(frontmatter[1], "slug") ?? entry.name.replace(/\.md$/, ""),
      visibility: frontmatterValue(frontmatter[1], "visibility") ?? "draft",
    });
  }
  return records.sort((a, b) => a.slug.localeCompare(b.slug));
};

export const readPageVisibilities = (dir = PAGES_DIR) => {
  if (!fs.existsSync(dir)) return {};
  const visibilities = {};
  for (const name of fs.readdirSync(dir).sort()) {
    if (!name.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(dir, name), "utf-8");
    const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatter) continue;
    const id = name.replace(/\.md$/, "");
    visibilities[id] = frontmatterValue(frontmatter[1], "visibility") ?? "draft";
  }
  return visibilities;
};

export const pageRoutes = (dir = PAGES_DIR) => resolveRoutes(readPageVisibilities(dir));

export const readCollectionRecords = (contentRoot = CONTENT_ROOT) => {
  const resourcesDir = path.join(contentRoot, "resources");
  const toolsDir = path.join(resourcesDir, "tools");
  const wikiDir = path.join(resourcesDir, "wiki");
  const sources = new Map([
    ["resources", { dir: resourcesDir, ignored: new Set([toolsDir, wikiDir]) }],
    ["tools", { dir: toolsDir, ignored: new Set() }],
    ["wiki", { dir: wikiDir, ignored: new Set() }],
  ]);
  return Object.fromEntries(
    collectionNames().map((name) => {
      const source = sources.get(name) ?? {
        dir: path.join(contentRoot, name),
        ignored: new Set(),
      };
      return [name, readRecords(source.dir, source.ignored)];
    }),
  );
};

export const collectionEntryRoutes = (contentRoot = CONTENT_ROOT) =>
  resolveCollectionEntryRoutes(readCollectionRecords(contentRoot));

export const collectionDiscoveryRoutes = (contentRoot = CONTENT_ROOT) =>
  resolveCollectionDiscoveryRoutes(readCollectionRecords(contentRoot));

export const readCaseStudyRecords = (dir = path.join(CONTENT_ROOT, CASE_STUDIES_COLLECTION)) =>
  readRecords(dir);

export const caseStudyRoutes = (dir = path.join(CONTENT_ROOT, CASE_STUDIES_COLLECTION)) =>
  resolveCollectionDiscoveryRoutes({ [CASE_STUDIES_COLLECTION]: readRecords(dir) });
