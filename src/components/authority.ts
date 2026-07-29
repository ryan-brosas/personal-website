// Node-importable presentation decisions for authority components. Each function
// delegates to the entity, evidence, freshness, or relationship policy rather
// than reimplementing it in an Astro render wrapper.
import { PERSON_ENTITY } from "../config/entities.ts";
import type { PersonEntity } from "../config/entities.ts";
import { resolvePublicClaim } from "../lib/evidence.ts";
import type { ClaimRecord, SourceRecord, SourceRegistry } from "../lib/evidence.ts";
import { nextModifiedAt } from "../lib/freshness.ts";
import type { ChangeKind } from "../lib/freshness.ts";
import type { PublicationDates } from "../lib/content-schemas.ts";
import { getRelatedList } from "../lib/relationships.ts";
import type { RelationshipRef } from "../lib/relationships.ts";
import type { CollectionsMap } from "../lib/publishing.ts";

// Byline — the single author entity (never invented per page).
export const bylinePerson = (): PersonEntity => PERSON_ENTITY;

// EvidenceNote — the public-safe backing sources for a claim, or [] when the claim
// is non-approved (blocked/retired), unresolvable, or backed only by an
// internal-only source. `resolvePublicClaim` is the authority; a public page
// therefore never surfaces a non-approved or internal-only-backed claim.
export const evidenceSources = (claim: ClaimRecord, registry: SourceRegistry): SourceRecord[] => {
  const resolved = resolvePublicClaim(claim, registry);
  return resolved.ok ? resolved.sources : [];
};

// FreshnessNotice — the date to surface, or undefined for a trivial / non-substantive
// edit. INV-13: only a substantive change bumps `modifiedAt`, so a trivial edit
// manufactures no freshness and the notice renders nothing.
export const freshnessDate = (
  dates: PublicationDates,
  kind: ChangeKind,
  now: string,
): string | undefined => {
  const update = nextModifiedAt(dates, kind, now);
  return update.changed ? update.modifiedAt : undefined;
};

// RelatedContent — the subset of refs whose target is public. `getRelatedList`
// drops non-public / unresolvable targets (no throw), so a partially-published
// content graph still renders and a public page never links a non-public target.
export const relatedRefs = (
  refs: readonly RelationshipRef[],
  collections: CollectionsMap,
): RelationshipRef[] => getRelatedList(refs, collections);
