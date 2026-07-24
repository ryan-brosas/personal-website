// T8 freshness policy kernel (Plan seo-geo-authority-refactor, design §13, INV-13).
// INV-13: `modifiedAt` changes ONLY for a substantive visible change — formatting-
// or frontmatter-only edits must never manufacture freshness. Plus stale detection
// against `expiresAt` (hard freshness gate) and `reviewedAt` (review cadence).
// Pure: `now` is injected as an ISO string; no `Date.now()` in policy logic.
import type { PublicationDates } from "./content-schemas.ts";

// Classification of a content edit. The substantive set alters visible meaning;
// the rest are cosmetic/internal and never bump `modifiedAt`.
export type ChangeKind =
  | "body-text"
  | "heading"
  | "data-value"
  | "new-section"
  | "frontmatter-meta"
  | "formatting"
  | "typo-fix";

const SUBSTANTIVE_CHANGES: readonly ChangeKind[] = [
  "body-text",
  "heading",
  "data-value",
  "new-section",
];

export const isSubstantiveChange = (kind: ChangeKind): boolean =>
  SUBSTANTIVE_CHANGES.includes(kind);

export interface FreshnessUpdate {
  modifiedAt: string | undefined;
  changed: boolean;
}

// Decide the `modifiedAt` to persist. Substantive change -> `now`; otherwise the
// existing `modifiedAt` is preserved unchanged (no fabricated freshness, INV-13).
export const nextModifiedAt = (
  dates: PublicationDates,
  kind: ChangeKind,
  now: string,
): FreshnessUpdate => {
  if (!isSubstantiveChange(kind)) return { modifiedAt: dates.modifiedAt, changed: false };
  return { modifiedAt: now, changed: true };
};

// Past the optional hard freshness gate.
export const isExpired = (dates: PublicationDates, now: string): boolean =>
  dates.expiresAt !== undefined && Date.parse(now) > Date.parse(dates.expiresAt);

// Never-reviewed content, or content whose last review is older than the allowed
// interval, is review-stale.
export const isReviewStale = (
  dates: PublicationDates,
  now: string,
  maxReviewAgeDays: number,
): boolean => {
  if (dates.reviewedAt === undefined) return true;
  const ageMs = Date.parse(now) - Date.parse(dates.reviewedAt);
  return ageMs > maxReviewAgeDays * 24 * 60 * 60 * 1000;
};

export type ReviewState = "unreviewed" | "reviewed" | "stale";

// Combined review workflow state: unreviewed (no reviewedAt), stale (expired or
// past review interval), otherwise reviewed.
export const reviewStateFor = (
  dates: PublicationDates,
  now: string,
  maxReviewAgeDays: number,
): ReviewState => {
  if (dates.reviewedAt === undefined) return "unreviewed";
  if (isExpired(dates, now) || isReviewStale(dates, now, maxReviewAgeDays)) return "stale";
  return "reviewed";
};
