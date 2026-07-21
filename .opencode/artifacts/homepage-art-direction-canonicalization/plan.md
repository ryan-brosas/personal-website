---
status: blocked
effort: M
slice: P02B
depends_on:
  - ".opencode/artifacts/homepage-art-direction/acceptance.md: Status: accepted"
gates:
  - "Plan 03 Task 1 shared visual integration"
  - "Plan 04 homepage choreography"
must_haves:
  truths:
    - "The accepted prototype has one authoritative motion contract and synchronized local proof surfaces."
    - "The existing registered design-system record is current, published, and renders working production assets."
    - "No downstream plan treats a locally accepted but undistributed prototype as production-ready."
  artifacts:
    - path: "docs/Ryan-Brosas-Brand-System/DESIGN.md"
      provides: "Accepted Signal Path motion contract"
    - path: "docs/Ryan-Brosas-Brand-System/showcase-landing-page.html"
      provides: "Byte-identical indexed mirror"
    - path: "docs/Ryan-Brosas-Brand-System/system/artifacts/landing.html"
      provides: "Resource-rebased renderer mirror"
    - path: "docs/Ryan-Brosas-Brand-System/assets/source-previews/ryan-brosas-landing-page-applied.png"
      provides: "Accepted 1800px-wide full-page capture"
    - path: "user:brand-design-system"
      provides: "Existing published registered package"
  key_links:
    - from: ".opencode/artifacts/homepage-art-direction/acceptance.md"
      to: "docs/Ryan-Brosas-Brand-System/DESIGN.md"
      via: "accepted prototype hash and decision"
    - from: "docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html"
      to: "showcase-landing-page.html and system/artifacts/landing.html"
      via: "deterministic generation from one canonical source"
    - from: "local brand package"
      to: "user:brand-design-system"
      via: "authorized in-place Open Design synchronization and remote verification"
---

# Plan: Signal Path Canonicalization and Distribution

## Goal

Canonicalize and distribute the accepted P02A prototype before Plan 03 consumes shared
visual rules or Plan 04 implements the homepage choreography.

## Constraints

- Start only when P02A `acceptance.md` says `Status: accepted` and its prototype hash
  matches the current canonical file, and the accepted P02A files are committed.
- Do not alter the accepted choreography, copy, claims, images, routes, or identity. A
  visual change returns to P02A.
- Generate mirrors from the canonical page; never hand-edit either mirror.
- Preserve the remote id `user:brand-design-system`; never create a duplicate record.
- Missing external synchronization tooling/access is a blocker, not permission to claim
  completion from local parity.
- Each task changes at most three repository files.

## Dependency Graph

```text
P02A accepted hash
  -> Task 1: contract + local mirrors
       -> Task 2: capture + audit + registered-package checkpoint
            -> Task 3: status closeout and production handoff
                 -> Plan 03 Task 1
                 -> Plan 04
```

## Task 1 — Codify the Contract and Regenerate Local Mirrors

**Needs:** accepted P02A hash matches canonical.
**Creates:** authoritative contract and deterministic local distribution.
**Checkpoint metadata:** `has_checkpoint: false`.
**Files:**

- `docs/Ryan-Brosas-Brand-System/DESIGN.md`
- `docs/Ryan-Brosas-Brand-System/showcase-landing-page.html`
- `docs/Ryan-Brosas-Brand-System/system/artifacts/landing.html`

### Steps

1. Verify the handoff before editing:

   ```bash
   python3 - <<'PY'
   from hashlib import sha256
   from pathlib import Path
   import re

   acceptance_path = Path(".opencode/artifacts/homepage-art-direction/acceptance.md")
   canonical_path = Path("docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html")
   acceptance = acceptance_path.read_text(encoding="utf-8")

   statuses = re.findall(r"^Status: accepted$", acceptance, re.MULTILINE)
   prototypes = re.findall(
       r"^Prototype SHA-256: ([0-9a-f]{64})$", acceptance, re.MULTILINE
   )
   eligibility = re.findall(r"^P02B eligibility: yes$", acceptance, re.MULTILINE)
   assert len(statuses) == 1, "acceptance is not uniquely accepted"
   assert len(prototypes) == 1, f"expected one prototype hash, found {len(prototypes)}"
   assert len(eligibility) == 1, "P02B eligibility is not uniquely yes"
   expected = prototypes[0]
   actual = sha256(canonical_path.read_bytes()).hexdigest()
   assert actual == expected, f"canonical hash {actual} != accepted hash {expected}"
   print(f"accepted handoff: {actual} PASS")
   PY
   ```

   Expected: prints `accepted handoff: <64-lowercase-hex> PASS`. Any missing,
   duplicate, malformed, or mismatched field stops P02B before it edits a file.

2. Extend `DESIGN.md` with the accepted homepage-only exception: visual sequence,
   `150–220ms` functional and `400–700ms` editorial bands, one-shot/settlement rule,
   static/no-JS/reduced-motion fallback, progressively enhanced mobile navigation,
   performance properties, internal-route restraint, and prohibited patterns.

3. Copy canonical bytes to the indexed mirror, then generate the renderer from canonical
   using only these replacements:

   ```bash
   cp docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html \
     docs/Ryan-Brosas-Brand-System/showcase-landing-page.html
   python3 - <<'PY'
   from pathlib import Path

   root = Path("docs/Ryan-Brosas-Brand-System")
   source = (root / "ryan-brosas-landing-page.html").read_text(encoding="utf-8")
   rendered = source.replace('href="tokens.css"', 'href="../../tokens.css"')
   rendered = rendered.replace('src="logos/', 'src="../../logos/')
   rendered = rendered.replace('src="assets/', 'src="../../assets/')
   (root / "system/artifacts/landing.html").write_text(rendered, encoding="utf-8")
   PY
   ```

4. Verify forward and reverse parity:

   ```bash
   python3 - <<'PY'
   from pathlib import Path

   root = Path("docs/Ryan-Brosas-Brand-System")
   canonical = (root / "ryan-brosas-landing-page.html").read_bytes()
   showcase = (root / "showcase-landing-page.html").read_bytes()
   rendered = (root / "system/artifacts/landing.html").read_text(encoding="utf-8")
   assert showcase == canonical, "canonical/showcase byte parity failed"
   source = canonical.decode("utf-8")
   expected_rendered = source.replace('href="tokens.css"', 'href="../../tokens.css"')
   expected_rendered = expected_rendered.replace('src="logos/', 'src="../../logos/')
   expected_rendered = expected_rendered.replace('src="assets/', 'src="../../assets/')
   assert rendered == expected_rendered, "renderer forward parity failed"
   reversed_text = rendered.replace('href="../../tokens.css"', 'href="tokens.css"')
   reversed_text = reversed_text.replace('src="../../logos/', 'src="logos/')
   reversed_text = reversed_text.replace('src="../../assets/', 'src="assets/')
   assert reversed_text.encode("utf-8") == canonical, "renderer reverse parity failed"
   print("local mirror parity: PASS")
   PY
   ```

   Expected: prints `local mirror parity: PASS`. The single verifier fails nonzero for
   canonical/showcase, forward-renderer, or reverse-renderer drift; no later command can
   mask an earlier mismatch.

5. Verify text integrity, then serve the package and open canonical, showcase, and
   renderer URLs. Every local resource must return 200 and the console must stay clean:

   ```bash
   python3 - <<'PY'
   from pathlib import Path

   paths = [
       Path("docs/Ryan-Brosas-Brand-System/DESIGN.md"),
       Path("docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html"),
       Path("docs/Ryan-Brosas-Brand-System/showcase-landing-page.html"),
       Path("docs/Ryan-Brosas-Brand-System/system/artifacts/landing.html"),
   ]
   signatures = ("\ufffd", "Ã", "Â", "â€")
   for path in paths:
       text = path.read_text(encoding="utf-8")
       assert not any(signature in text for signature in signatures), path
   print("active text integrity: PASS")
   PY
   python3 -m http.server 4173 --bind 127.0.0.1 \
     --directory docs/Ryan-Brosas-Brand-System
   ```

   Expected: Python prints `active text integrity: PASS`; browser requests for
   `/ryan-brosas-landing-page.html`, `/showcase-landing-page.html`, and
   `/system/artifacts/landing.html` plus their resources are local 200s with no console
   error. Any mismatch blocks Task 2.

**Risk:** an overly broad path replacement can change content bytes. Only the three exact
attribute prefixes above are permitted.

## Task 2 — Refresh the Capture and Verify Registered Distribution

**Needs:** Task 1.
**Creates:** accepted capture plus local-audit and remote-publication evidence.
**Checkpoint metadata:** `has_checkpoint: true`; `checkpoint: human-action`.
**Files:**

- `docs/Ryan-Brosas-Brand-System/assets/source-previews/ryan-brosas-landing-page-applied.png`
- `.opencode/artifacts/homepage-art-direction/acceptance.md`
- `.opencode/state.md`

### Steps

1. At `1800` CSS pixels wide with normal motion settled, capture the complete canonical
   page to the existing PNG path. Exclude browser chrome. Confirm PNG width exactly:

   ```bash
   python3 - <<'PY'
   from pathlib import Path
   import struct

   path = Path("docs/Ryan-Brosas-Brand-System/assets/source-previews/ryan-brosas-landing-page-applied.png")
   data = path.read_bytes()
   assert data[:8] == b"\x89PNG\r\n\x1a\n"
   width, height = struct.unpack(">II", data[16:24])
   assert width == 1800 and height > 0
   print(f"capture: {width}x{height} PASS")
   PY
   ```

2. From `docs/Ryan-Brosas-Brand-System`, test whether the documented audit tooling is
   available, without printing secrets:

   ```bash
   test -n "${OD_NODE_BIN:-}" && test -x "$OD_NODE_BIN"
   test -n "${OD_BIN:-}" && test -f "$OD_BIN"
   "$OD_NODE_BIN" "$OD_BIN" tools connectors design-system-package-audit \
     --path . --fail-on-warnings
   ```

   Expected: all checks exit `0`; audit reports no warnings. If variables, tooling, or
   audit capability are unavailable, create or replace the single **P02B Distribution**
   section in `acceptance.md` with the capture result, audit result, exact capability
   blocker, and `Distribution: blocked`; update `.opencode/state.md` to the exact line
   `**P02B status:** blocked; see acceptance record`, replacing the prior P02B status
   line rather than appending a duplicate, then stop P02B here.

3. After the capture and audit pass, create or replace the single **P02B Distribution**
   section in `acceptance.md` with capture dimensions/hash, audit command/result, and
   `Distribution: pending-human-action`. Persist that record **before** pausing. Ask the
   operator to identify or perform an authorized in-place Open Design sync; do not infer
   authorization from local tooling and do not continue automatically past this
   checkpoint. Before asking, update live state to the exact line
   `**P02B status:** pending human action`, replacing the prior P02B status line.

4. After the human-action checkpoint, use the authorized Open Design UI/API/CLI path to
   synchronize the package **in place**. No local executable publish command is known;
   record the actual verified method rather than inventing one. Confirm and record:
   - id remains exactly `user:brand-design-system`, with no duplicate;
   - `Registered package status: published` (do not add another generic `Status` field);
   - registered changed-file hashes match local `DESIGN.md`, canonical landing,
     showcase mirror, renderer mirror, and applied capture;
   - Design System Assets selects the landing proof, Showcase displays the adopted
     production logo, and the stylesheet/logo/image URLs return 200;
   - normal and reduced-motion final states render from the registered package.

5. Update that same **P02B Distribution** section with sync method, unchanged id,
   `Registered package status: published`, hashes, URL checks, reviewer/date, and
   `Distribution: verified` only after every remote assertion passes. If authorized
   access, synchronization, or remote inspection is unavailable or any assertion fails,
   set `Distribution: blocked` with the exact non-secret blocker. Record
   deviations/discoveries in the same distribution section. Set live state to the exact
   line `**P02B status:** verified; closeout pending` after verification, or to
   `**P02B status:** blocked; see acceptance record` on failure. Never record
   credentials, cookies, tokens, or private API responses.

**Checkpoint outcome:** `pending-human-action` pauses the task; `blocked` stops it;
only `Distribution: verified` permits Task 3.

## Task 3 — Close the Gates and Hand Off

**Needs:** Task 2 `Distribution: verified`; verified Task 2 files committed so `HEAD` is
the immutable pre-closeout baseline.
**Creates:** consistent downstream status.
**Checkpoint metadata:** `has_checkpoint: false`.
**Files:**

- `.opencode/artifacts/website-build/plan.md`
- `.opencode/artifacts/website-build/todo.md`
- `.opencode/state.md`

### Steps

1. Before editing, require the three task files to be clean relative to `HEAD`:

   ```bash
   git diff --quiet -- \
     .opencode/artifacts/website-build/plan.md \
     .opencode/artifacts/website-build/todo.md \
     .opencode/state.md
   git diff --cached --quiet -- \
     .opencode/artifacts/website-build/plan.md \
     .opencode/artifacts/website-build/todo.md \
     .opencode/state.md
   ```

   Expected: both commands exit `0`. Otherwise stop and coordinate; Task 3 must not
   absorb another track's uncommitted status edit.

2. Mark P02A accepted and P02B complete in the master status/checklist. In both the
   master plan and live state, add the exact anchored status lines
   `**P02A status:** accepted` and
   `**P02B status:** complete; registered distribution verified`, plus
   `**Production motion status:** not implemented; Plan 04 remains pending`. Replace—not
   supplement—the prior P02 pending/rerun prose, and remove only the resolved P02A/P02B
   `[GATE]`/`[GATE: ...]` blocker bullets. Preserve every non-P02 blocker and the
   task-level dependency:
   Plan 03 may start semantic shell work after Plan 01, but its Task 1 shared visual
   integration and M2 completion require P02B; Plan 04 requires P02B.
3. Point downstream work to the accepted prototype hash, `DESIGN.md` contract, and P02A
   acceptance record. Do not describe production motion as implemented.
4. Verify status consistency and prove that Task 3 preserved every pre-existing non-P02
   blocker from `HEAD`:

   ```bash
   python3 - <<'PY'
   from pathlib import Path
   import re
   import subprocess

   acceptance_path = Path(".opencode/artifacts/homepage-art-direction/acceptance.md")
   master_path = Path(".opencode/artifacts/website-build/plan.md")
   todo_path = Path(".opencode/artifacts/website-build/todo.md")
   state_path = Path(".opencode/state.md")
   acceptance = acceptance_path.read_text(encoding="utf-8")
   master = master_path.read_text(encoding="utf-8")
   todo = todo_path.read_text(encoding="utf-8")
   state = state_path.read_text(encoding="utf-8")

   def one(pattern: str, text: str, label: str) -> str:
       values = re.findall(pattern, text, re.MULTILINE)
       assert len(values) == 1, f"expected one {label}, found {len(values)}"
       return values[0] if isinstance(values[0], str) else values[0][0]

   one(r"^Status: accepted$", acceptance, "accepted status")
   one(r"^Prototype SHA-256: ([0-9a-f]{64})$", acceptance, "prototype hash")
   one(r"^P02B eligibility: yes$", acceptance, "P02B eligibility")
   one(r"^Distribution: verified$", acceptance, "verified distribution")

   for label in ("P02A", "P02B"):
       boxes = re.findall(
           rf"^- \[([ x])\] {label}\b.*$", todo, re.MULTILINE
       )
       assert boxes == ["x"], f"{label} checklist is not uniquely complete: {boxes}"

   status_lines = (
       r"^\*\*P02A status:\*\* accepted$",
       r"^\*\*P02B status:\*\* complete; registered distribution verified$",
       r"^\*\*Production motion status:\*\* not implemented; Plan 04 remains pending$",
   )
   for pattern in status_lines:
       assert len(re.findall(pattern, master, re.MULTILINE)) == 1, pattern
       assert len(re.findall(pattern, state, re.MULTILINE)) == 1, pattern

   gate_bullet = r"^\s*-\s+`?\[GATE[^\n]*\bP02[AB]\b"
   assert not re.search(gate_bullet, master, re.MULTILINE), "master retains P02 gate"
   assert not re.search(gate_bullet, state, re.MULTILINE), "state retains P02 gate"

   def at_head(path: Path) -> str:
       result = subprocess.run(
           ["git", "show", f"HEAD:{path.as_posix()}"],
           check=True,
           capture_output=True,
       )
       return result.stdout.decode("utf-8")

   def section(text: str, heading: str) -> str:
       match = re.search(
           rf"^{re.escape(heading)}\n(.*?)(?=^## |\Z)",
           text,
           re.MULTILINE | re.DOTALL,
       )
       assert match, f"missing section: {heading}"
       return match.group(1)

   def non_p02_blockers(text: str, heading: str) -> list[str]:
       body = section(text, heading)
       bullets = re.findall(r"^- .*(?:\n {2,}.*)*", body, re.MULTILINE)
       return [
           bullet
           for bullet in bullets
           if ("[GATE" in bullet or "[UNCERTAIN" in bullet)
           and not re.search(r"\bP02[AB]\b", bullet)
       ]

   assert non_p02_blockers(master, "## Open Blockers") == non_p02_blockers(
       at_head(master_path), "## Open Blockers"
   ), "Task 3 changed a non-P02 master blocker"
   assert non_p02_blockers(state, "## Blockers (not started)") == non_p02_blockers(
       at_head(state_path), "## Blockers (not started)"
   ), "Task 3 changed a non-P02 state blocker"

   normalized_master = re.sub(r"\s+", " ", master)
   normalized_state = re.sub(r"\s+", " ", state)
   assert (
       "Plan 03 may begin semantic shell work after Plan 01; only its Task 1 shared "
       "visual integration and M2 exit wait on completed P02B. Plan 04 also waits on P02B."
       in normalized_master
   ), "task-level Plan 03/04 dependency changed"
   assert (
       "Plan 03 semantic-shell work may start after M1; its Task 1 visual integration "
       "and M2 completion additionally require P02B."
       in normalized_state
   ), "live-state Plan 03 dependency changed"
   stale = (
       "are pending; no production motion has been implemented",
       "Both are pending.",
       "After the repository baseline is approved, run P02A",
       "Run P02B only after acceptance",
       "**P02B status:** verified; closeout pending",
   )
   assert not any(value in normalized_master for value in stale), "master retains pending prose"
   assert not any(value in normalized_state for value in stale), "state retains pending/rerun prose"
   print("P02A/P02B closeout: PASS")
   PY
   ```

   Expected: prints `P02A/P02B closeout: PASS`. The verifier fails for duplicate or
   non-exact acceptance fields, unchecked checklist items, missing anchored status lines,
   stale P02 gate/pending prose, changed non-P02 blockers, lost task-level dependencies,
   or a false production-motion completion claim.

The roadmap, ADR-004, and MEMORY use stable two-stage wording and require no completion
edit unless implementation invalidates that contract.

## Verification

P02B succeeds only when local mirror/capture checks pass, the package audit passes, the
existing remote record is verified current and published, all registered resources work,
and live status closes both gates. Local parity without remote verification is partial,
not complete.

## Risks & Failure Behavior

- Remote tooling/access unavailable: keep accepted local work; mark P02B blocked; do not
  unblock visual integration.
- Audit or mirror mismatch: fix generation/source drift before synchronization.
- Remote sync failure: preserve the accepted local canonical and retry the same existing
  record; never create a replacement id.
- Capture exporter artifact: verify the actual browser surface separately and record the
  exporter limitation; do not degrade browser behavior solely to satisfy stitching.

## Privacy & Security

- Never expose Open Design credentials, session cookies, private endpoints, or raw API
  responses in the repository.
- The registered package and capture contain approved public-safe brand content only.
- Hash and 200-status evidence is sufficient; redact machine-local paths from records.

## Open Question

- `[UNCERTAIN: The authorized in-place Open Design synchronization mechanism must be
  identified at Task 2. Repository docs define the outcome but include no proven local
  publish command.]`

## Next Command

Do not change `.opencode/artifacts/.active` and do not use `/ship` for this static-package
slice; its unconditional npm gates and lifecycle writes do not match these task
contracts. After P02A is accepted, hash-matched, and committed, hand this exact scoped
instruction to a build agent:

> Execute
> `.opencode/artifacts/homepage-art-direction-canonicalization/plan.md` sequentially.
> Modify only each task's declared files, run only its named static/browser/remote gates,
> commit each verified task before the next, and stop when Task 2 records
> `Distribution: pending-human-action` or `blocked`.
