---
title: "Building Agent Metrics"
description: "A public dashboard reports what my coding agents cost and how fast they run, without ever publishing what I asked them."
visibility: public
owner: ryan
kind: case-study
slug: pi-telemetry-dashboard
pillar: agent-reliability
evidence:
  kind: verified
  sourceId: source-pi-telemetry-dashboard-001
diagram:
  kind: disclosure-split
  caption: "The list on the left is refused by name, not by habit."
  withheld:
    label: "Stays on the machine"
    items:
      - "Prompt text"
      - "Tool arguments"
      - "Tool results"
      - "File paths"
      - "Session transcripts"
  released:
    label: "Leaves the machine"
    items:
      - "Hashed session id"
      - "Token counts"
      - "Model and provider"
      - "Reported cost"
      - "Active minutes"
  guard:
    label: "The guard"
    detail: "Every record is walked before it ships. A forbidden field stops the export and names where it was found, so a change that quietly starts carrying content fails instead of publishing."
cta:
  eyebrow: "Numbers you can publish"
  title: "Measure the agent, not the conversation."
  body: "If you want to report what your AI work costs without handing over what your team typed, bring me the data you are afraid to publish."
  primaryLabel: "Talk about your telemetry"
---

This is a self-project. The live dashboard is the proof, and so is the feed
behind it. Anyone can open both and check the claim this page makes.

The dashboard is a fork. The browser based speed inspector came from
[monotykamary/pi-tps-web](https://github.com/monotykamary/pi-tps-web). What I
added is the part below. An all session store, a boundary that decides what may
leave my machine, a public feed, and a way to compare what models cost.

## The problem

I run coding agents most of the working day. That raises two questions I could
not answer.

The first is money. What is this actually costing, and which provider is the
better deal for the work I do? Marketing pages quote a price per million tokens.
That number tells you almost nothing until you know your own mix of fresh input,
cached input, and output.

The second is speed. Agents feel fast or slow, but feelings are not a measure. I
wanted tokens per second, time to first token, and stalls.

There is an obvious way to answer both. Ship the logs somewhere and query them.
That is also the problem. Agent logs are the worst possible thing to upload. They
hold prompts, tool arguments, tool results, file paths, and whole transcripts of
work that is not mine to publish.

So the goal became narrow. Publish enough to answer the money and speed
questions. Publish nothing about what was said.

## What had to be true

- **Raw history never leaves the machine.** The local view can read everything.
  The public feed cannot.
- **The boundary is code, not care.** A rule I have to remember is a rule I will
  break at midnight.
- **The public feed is checkable.** Anyone can fetch it and confirm what is in it.
- **Local and public use one path.** Hosted data loads through the same parser
  and queries as local history, so the public view cannot drift into its own
  quiet dialect.

## What I built

### Where the numbers come from

The agent extension records each turn. Tokens in and out, cached reads and
writes, reported cost, tokens per second, time to first token, stalls, and the
provider and model that served it. Activity is counted too. Prompts, minutes I
was active, minutes the agent was active.

Local analysis runs in the browser on DuckDB compiled to WebAssembly. Nothing is
uploaded to look at my own history. The endpoint that serves raw history binds
only to 127.0.0.1, because those files hold transcripts.

### The boundary that decides what leaves

One module owns the line. It never accepts or emits prompt text, tool arguments,
tool results, file paths, or transcripts. What may leave is short. A hashed
session id, token counts, a model and provider name, reported cost, and counts of
minutes and prompts.

The session id is hashed with SHA-256 and cut to 16 characters, so runs can be
grouped without naming anything.

The part that matters is that this is enforced, not documented. There is a list
of field names that must never appear in a record, and a check that walks every
record before it ships. If a forbidden field is found anywhere in the object, the
export throws and names the field and its path. A future change that quietly
starts carrying content does not get published. It fails.

### A feed anyone can audit

The relay writes sanitized records on a timer and publishes them. A compact
snapshot sits in front of the detailed feed, so the public dashboard can draw
without downloading everything or starting a database in your browser.

Because the feed is public, the promise is testable. You do not have to believe
the boundary works. You can fetch the file and look.

### Comparing what models cost

The last piece answers the money question. A market view lists model prices,
context limits, privacy terms, discounts, and which options are subscriptions. It
runs without uploading any telemetry, so I can compare rates against my own
measured mix rather than against a vendor example.

That mix turned out to be the whole answer. In the published window, cached reads
are about 96 percent of all tokens. A price per million output tokens is close to
irrelevant next to the cache read rate.

## What changed during the build

One afternoon the dashboard froze. It was not one bug. It was four, stacked.

A failed load of the detailed feed retried on its own, so a slow response became
a storm of requests. The loader is now owned and serialized, errors latch, and a
retry only happens when a person asks for one.

The anomaly view rendered a card for every anomaly it found. It now takes fifty
and keeps the true total from a window function, so the count stays honest while
the page stays finite.

The request inspector collapsed as its content grew, so it now holds a fixed
400 pixel viewport that cannot shrink.

Loading rows into DuckDB ran as a loop of insert statements. Replacing that loop
with one native CSV copy made ingestion about seven times faster.

Each of those four has a regression test now. That is the part I care about. A
frozen page is rarely one mistake. It is usually several small ones that only
become visible together.

## How it is checked

The source is public at
[github.com/ryan-brosas/pi-dashboard](https://github.com/ryan-brosas/pi-dashboard).

Fifteen test files cover the parser, the relay boundary, the public snapshot,
pricing, speed maths, DuckDB loading, and the dashboard queries. On 29 July 2026
a run of typecheck, 111 tests, lint, and build passed together.

The tests that matter most guard the boundary. They check that a record carrying
a forbidden field is rejected rather than trimmed, and that session ids are
hashed on the way out.

CI stages a build and publishes it to the server as one atomic release.

## The result

The dashboard is live at
[dashboard.ryanjosebrosas.dev](https://dashboard.ryanjosebrosas.dev/) and its
feed is open.

On 30 July 2026 that feed held 23,869 sanitized records, aggregated into 308
usage rows and 278 activity rows across 143 sessions. Every session id was a 16
character hash. I checked every field name the feed emits against the forbidden
list. There were none.

The window covered 26 to 29 July 2026 and reported about 4.53 billion tokens, of
which about 4.35 billion were cached reads, alongside 1,064 prompts, and about
2,695 US dollars of reported cost.

That cost figure needs care. It is what the same token usage would bill at
provider rates. Several of these routes are subscriptions, so it is a comparison
number, not a receipt.

## What remains limited

The dashboard measures my own machine. It is one person's usage, so it says
nothing about how a team would use it.

Cost is only as good as the rates behind it. A missing or stale rate produces a
confident number that is wrong, and the number is API equivalent rather than what
left my bank.

The boundary is proven for the fields the code knows to refuse. It blocks a named
list. A new field with an innocent name that happens to carry content would need
that list to be updated.

Several checks are still open. Manifest rollover, disclosed snapshot coverage,
timer behaviour after downtime, and publication failure limits are all written
down as unverified rather than quietly assumed.

So the claim is narrow and testable. A public page reports what my agents cost
and how fast they run, the feed behind it carries no conversation, and you can
confirm that yourself in one request.
