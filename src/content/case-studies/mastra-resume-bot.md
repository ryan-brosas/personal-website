---
title: "A Résumé Bot That Shows Its Source"
description: "How I turned a three-page résumé into a live Mastra bot that answers questions and shows the passage behind each answer."
visibility: public
owner: ryan
kind: case-study
slug: mastra-resume-bot
pillar: context-knowledge-systems
evidence:
  kind: verified
  sourceId: source-mastra-resume-bot-live-001
---

This is a self-project, not a client result. The live bot is the proof. It shows
what a reader can ask, what comes back, and what happens when the service cannot
return a checked answer.

## The problem

A résumé can hold the right facts and still make a reader do the search. A
recruiter may want one detail about a role, tool, or project. Reading every page
is not always the fastest path.

A plain chatbot would make that search easier, but it would add a new trust
problem. A smooth answer is not enough. The reader needs to see which part of
the résumé supports it.

The goal was narrow. Let a person ask about my work, then show the source passage
behind the answer.

## What had to be true

I set four rules for the build.

- **The résumé stays in charge.** The bot should answer from the loaded document,
  not from a broad web search.
- **The source stays visible.** Each cited answer needs a page, excerpt, and view
  of the matching part of the document.
- **Failure stays honest.** Bad input, missing source data, search trouble, and a
  failed model call need clear states.
- **The scope stays small.** The bot answers questions. It does not take actions,
  change the résumé, or pretend to know what the source does not contain.

These rules turned the work from a chat demo into a source-bound question path.

## What I built

### A versioned source bundle

The live service exposes one three-page résumé. A content version ties the source
document to the page images and citation data used by the interface.

A citation carries the page number, source excerpt, selected quote, and a set of
page coordinates. Those coordinates let the client crop the page around the
matching passage instead of showing a full page with no clue where to look.

### A small answer path

The browser sends a question and a short prior history to the same origin. The
Mastra service returns the answer with its citations, source pages, content
version, and any figures it could not support.

The client then builds the answer from text and source cards. If no citation
comes back, it says the résumé does not cover the question. It does not turn a
missing source into visual proof.

### Controlled failure states

The request boundary rejects an empty question with a clear error. The interface
also has named states for rate limits, a missing résumé, search trouble, and a
failed model call.

Each state gives the reader a next step. A retry replaces the failed reply in the
same turn, so the thread does not fill with copies of one question.

## What changed during the build

The evidence view created a layout problem. A cropped résumé passage can be much
taller than a short chat reply. Scrolling to the end left the answer above the
visible area and made the thread look stuck.

I changed the scroll rule. The newest question now sits near the top, while the
page keeps enough room below the answer. A reader can follow the question,
answer, and source in one place.

The retry path also needed care. Running the request as a new turn would repeat
the question. The final client reuses the same answer slot and keeps the history
from before that question.

These are small details, but they decide whether the proof feels connected to
the answer or bolted on after it.

## The result

The résumé bot is live as a separate service. In a checked public run, the
question about my Bluelogic role returned one answer, one page-three citation,
the matching excerpt, and a crop of the source passage.

The document endpoint reports the same three-page source and content version
used by the answer. An empty question returns a controlled client error before
an answer is generated.

This result proves the public question, answer, and source path works for the
checked run. It does not prove every possible answer is correct. It also does not
show a hiring result, time saved, or a change in recruiter behavior.

## What remains limited

The bot knows only the résumé loaded into this service. If the document is old,
the answer can also be old. A citation shows where an answer came from, but it
does not make the source claim true by itself.

One public run is not a quality benchmark. Broader answer checks still need a
fixed question set, expected source passages, and repeated results over time.

The useful proof today is smaller. A reader can ask one question, inspect the
answer, and see the exact part of the résumé used to support it.
