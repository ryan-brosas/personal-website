// The homepage evidence rail. A proof point is content (src/content/proof/*.md),
// but it reaches the page through the SAME evidence kernel that gates every other
// public claim: an entry whose source is unregistered, internal-only, or whose own
// status is not approved is withheld rather than rendered unbacked.
//
// This is display-only. It deliberately does NOT feed `resolveHomeVisibility`, so
// adding or removing a proof point can never change whether "/" is indexed.
import { resolvePublicClaim } from "./evidence.ts";
import type { SourceRegistry } from "./evidence.ts";
import type { ProofPointRecord } from "./content-schemas.ts";

export interface ProofPoint extends ProofPointRecord {
  readonly id: string;
}

export const selectPublicProofPoints = (
  points: readonly ProofPoint[],
  registry: SourceRegistry,
): ProofPoint[] =>
  points
    .filter(
      (point) =>
        resolvePublicClaim(
          {
            id: point.id,
            statement: `${point.value} ${point.label}`,
            kind: "metric",
            sourceIds: [point.sourceId],
            status: point.status,
          },
          registry,
        ).ok,
    )
    .sort((a, b) => a.order - b.order);
