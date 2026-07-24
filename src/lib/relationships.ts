// T8 relationship helper (Plan seo-geo-authority-refactor, design §12, INV-11).
// Reuses the publishing kernel's public->public-ONLY `resolveRelationship`
// (NEVER weakened here) and adds a UI-safety helper that returns an EMPTY related
// list for any non-public target (draft/noindex/missing collection/missing id),
// instead of failing the build. This is the sequencing/empty fix: dev-time linking
// to a still-`noindex` case study drops the link rather than relaxing policy.
// A public page therefore never renders a link to a non-public target.
import { resolveRelationship } from "./publishing.ts";
import type { RelationshipTarget, CollectionsMap } from "./publishing.ts";

// Typed {collection, id} reference — the same shape the kernel resolves.
export type RelationshipRef = RelationshipTarget;

// Returns only the refs whose target is public (discoverable) per the unchanged
// `resolveRelationship` gate. Non-public / unresolvable refs are silently dropped
// — no throw — so a partially-published content graph still builds.
export const getRelatedList = (
  refs: readonly RelationshipRef[],
  collections: CollectionsMap,
): RelationshipRef[] => refs.filter((ref) => resolveRelationship(ref, collections).ok);
