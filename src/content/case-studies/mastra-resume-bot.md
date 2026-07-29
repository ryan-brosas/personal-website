---
title: "A Résumé Bot That Shows Its Source"
description: "A reader can ask one question about my work and see the exact résumé passage behind the answer."
visibility: public
owner: ryan
kind: case-study
slug: mastra-resume-bot
pillar: context-knowledge-systems
evidence:
  kind: verified
  sourceId: source-mastra-resume-bot-live-001
diagram:
  kind: source-loop
  caption: "A checked answer returns to the résumé passage that supports it."
  path:
    - label: "Question"
      detail: "The reader asks about one part of the work."
    - label: "Retrieve"
      detail: "The service finds matching résumé passages."
    - label: "Bounded answer"
      detail: "The reply stays inside the source facts."
    - label: "Citation"
      detail: "The page and quote stay beside the reply."
  fallback:
    label: "Cannot verify"
    detail: "The service names the limit instead of making up an answer."
  source:
    label: "The loaded résumé"
    pages: 3
    citedPage: 3
    passageLabel: "Quoted passage"
---

This is a self-project, not a client result. The live bot is the proof. It shows
what a reader can ask, what comes back, and what happens when the service cannot
return a checked answer.

## The problem

A recruiter opens a three-page résumé to check one thing. Maybe it is a tool, a
role, or a project. The facts are in there. The document just does not point to
them, so the reader scans all three pages.

A plain chatbot makes that search faster. It also adds a new problem. A smooth
answer gives the reader nothing to check, so the reader has to trust it.

That is why the goal stayed narrow. Let a person ask about my work. Then show the
exact passage that supports the answer.

## What had to be true

I set four rules before writing the service.

- **The résumé stays in charge.** Answers come from the loaded document, not from
  a broad web search.
- **The source stays visible.** Every cited answer carries a page, an excerpt,
  and a view of the matching part of the document.
- **Failure stays honest.** Bad input, a missing source, search trouble, and a
  failed model call each get their own state.
- **The scope stays small.** The bot answers questions. It does not act, edit the
  résumé, or fill gaps the source does not cover.

Those rules changed the shape of the build. It stopped being a chat demo and
became a path from question to source.

## What I built

### What it runs on

The service is TypeScript on Node 22. Mastra handles the agent and the routes. A
LibSQL store holds the indexed passages. Zod checks the shape of every request
and reply, so a bad request stops at the edge.

The Mastra packages sit at pinned versions. A lockfile and a frozen install keep
each build on the versions I checked.

The code splits along the same line as the problem. One half owns citations,
which covers the PDF source, the page manifest, the figures, and the trust rules.
The other half owns Mastra, which covers indexing, routes, and the request
boundary.

### A versioned source bundle

The service exposes one three-page résumé. A content version ties that document
to the page images and citation data the interface uses.

Each citation carries a page number, a source excerpt, the selected quote, and a
set of page coordinates. The coordinates are the part the reader feels. They let
the client crop the page around the passage, so a reader sees the sentence
instead of hunting through a full page.

### A small answer path

The browser sends a question and a short history to the same origin. The service
returns the answer, its citations, the source pages, the content version, and
anything it could not support.

The client builds the reply from text and source cards. When no citation comes
back, it tells the reader the résumé does not cover the question. A missing
source never turns into visual proof.

### Controlled failure states

An empty question is rejected at the request boundary with a clear error. The
interface also names states for rate limits, a missing résumé, search trouble,
and a failed model call.

Each state gives the reader a next step. A retry replaces the failed reply in
place, so one question does not stack up copies of itself in the thread.

## What changed during the build

The evidence view broke the layout. A cropped passage can run much taller than a
short answer. Scrolling to the bottom pushed the answer above the screen, and the
thread looked stuck.

So I changed the scroll rule. The newest question now settles near the top, and
the page keeps room below the answer. A reader can see the question, the answer,
and the source in one place.

Retry needed the same care. Running it as a new turn repeated the question. The
client now reuses the same answer slot and keeps the history from before that
question.

Both are small fixes. They decide whether the proof reads as part of the answer
or as something bolted on after it.

## How it is checked

The code is public at
[github.com/ryan-brosas/mastra-resume-citation-bot](https://github.com/ryan-brosas/mastra-resume-citation-bot).
You can read it and run the same checks I run.

Sixteen test files cover the parts that fail quietly. There are tests for the
request boundary, the routes, route failures, missing assets, retrieval,
segmentation, page geometry, image drift, and the trust rules.

Two of them carry most of the weight for a citation bot. The geometry test guards
the page coordinates that crop a passage. The image drift test catches a page
image that no longer matches the source it claims to show. Both protect one
promise. The crop a reader sees is the passage the answer used.

The citation bundle has a build step and a separate verify step. If the bundle
and the source document disagree, the check fails before anything ships.

CI runs on every push to main and on every pull request. It installs from a
frozen lockfile, audits production dependencies at high severity, adds the PDF
tools, and requires a real Chromium for the browser tests.

## The result

The résumé bot runs live as its own service.

In a checked public run, a question about my Bluelogic role returned one answer,
one page-three citation, the matching excerpt, and a crop of the source passage.
The document endpoint reported the same three-page source and content version the
answer used. An empty question returned a controlled error before any answer was
generated.

That run proves the public path from question to answer to source works.
It does not prove every possible answer is correct.
It also does not show a hiring result, time saved, or a change in recruiter behavior.

## What remains limited

The bot knows only the résumé loaded into this service. If that document is old,
the answer is old with it. A citation shows where an answer came from. It does
not make the source claim true.

One public run is not a benchmark. Real answer checks still need a fixed question
set, expected source passages, and repeated results over time.

So the proof today is small and specific. A reader can ask one question, read the
answer, and see the exact part of the résumé behind it.
