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

const readRecords = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const records = [];
  for (const name of fs.readdirSync(dir).sort()) {
    if (!name.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(dir, name), "utf-8");
    const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatter) continue;
    records.push({
      slug: frontmatterValue(frontmatter[1], "slug") ?? name.replace(/\.md$/, ""),
      visibility: frontmatterValue(frontmatter[1], "visibility") ?? "draft",
    });
  }
  return records;
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

export const readCollectionRecords = (contentRoot = CONTENT_ROOT) =>
  Object.fromEntries(
    collectionNames().map((name) => [name, readRecords(path.join(contentRoot, name))]),
  );

export const collectionEntryRoutes = (contentRoot = CONTENT_ROOT) =>
  resolveCollectionEntryRoutes(readCollectionRecords(contentRoot));

export const collectionDiscoveryRoutes = (contentRoot = CONTENT_ROOT) =>
  resolveCollectionDiscoveryRoutes(readCollectionRecords(contentRoot));

export const readCaseStudyRecords = (dir = path.join(CONTENT_ROOT, CASE_STUDIES_COLLECTION)) =>
  readRecords(dir);

export const caseStudyRoutes = (dir = path.join(CONTENT_ROOT, CASE_STUDIES_COLLECTION)) =>
  resolveCollectionDiscoveryRoutes({ [CASE_STUDIES_COLLECTION]: readRecords(dir) });
