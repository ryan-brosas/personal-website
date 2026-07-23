---
purpose: Cross-slug lifecycle index (lifecycle commands write, /xstatus reads)
updated: 2026-07-24
---

# Project Status

## Active Work

| Slug | Phase | Title | Status | Lifecycle | Updated |
|---|---|---|---|---|---|
| `m2-accessible-core-shell-closeout` | P3 | M2 aggregate close (doc-only ledger sync) | open | verified | 2026-07-24 |
| `m3-launch-inputs` | P4 | Resolve credible-core launch inputs | open | blocked | 2026-07-24 |

## Lifecycle Vocabulary

`created` → `planned` → `in-progress` → `blocked` → `verified` → `pr-open` → `merged`

## Notes

- `m2-accessible-core-shell-closeout` is documentation-only; no production code changes. The screen-reader smoke (no reader installed) is carried forward as a pre-release gate (P4/M3), not a blocker for this closeout.
- `m3-launch-inputs` is blocked on operator decisions: approved project artifact, final domain/host/CI, CMS infrastructure approvals.
