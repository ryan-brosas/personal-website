import { getCollection } from "astro:content";
import type { CollectionRecord } from "../lib/site-routes.ts";

export const getCollectionRouteRecords = async (): Promise<
  Record<string, CollectionRecord[]>
> => {
  const [caseStudies, resources, tools, wiki] = await Promise.all([
    getCollection("case-studies"),
    getCollection("resources"),
    getCollection("tools"),
    getCollection("wiki"),
  ]);
  return {
    "case-studies": caseStudies.map((entry) => ({
      slug: entry.data.slug,
      visibility: entry.data.visibility,
    })),
    resources: resources.map((entry) => ({
      slug: entry.data.slug,
      visibility: entry.data.visibility,
    })),
    tools: tools.map((entry) => ({
      slug: entry.data.slug,
      visibility: entry.data.visibility,
    })),
    wiki: wiki.map((entry) => ({
      slug: entry.data.slug,
      visibility: entry.data.visibility,
    })),
  };
};
