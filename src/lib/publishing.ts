// T2 RED stub — intentionally-wrong defaults so policy tests fail on
// assertions (behavior), not on module-not-found. Replaced in GREEN.
import { z } from "astro/zod";

export const DEFAULT_VISIBILITY = "public";

export const VisibilitySchema = z.literal("draft");
export type Visibility = z.infer<typeof VisibilitySchema>;

export const isDiscoverable = (_v: string): boolean => false;
export const isRoutable = (_v: string): boolean => false;

export const EvidenceSchema = z.object({});
export type Evidence = z.infer<typeof EvidenceSchema>;

export type SourceRegistry = Record<string, unknown>;
export type ValidateResult = { ok: boolean; error?: string };
export const validateEvidence = (_e: unknown, _registry: SourceRegistry): ValidateResult => ({
  ok: false,
});

export type RelationshipTarget = { collection: string; id: string };
export type CollectionEntry = { id: string; visibility: string };
export type CollectionsMap = Record<string, CollectionEntry[]>;
export type ResolveResult = { ok: boolean; target?: RelationshipTarget; error?: string };
export const resolveRelationship = (
  _ref: RelationshipTarget,
  _collections: CollectionsMap,
): ResolveResult => ({ ok: false });

export const DateFieldsSchema = z.object({});
export type DateFields = z.infer<typeof DateFieldsSchema>;
