---
title: "Building a Résumé Bot"
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
cta:
  eyebrow: "Answers over your own documents"
  title: "Make the answer point back to the page."
  body: "If a wrong answer would cost you, the reply needs a source your reader can open. Bring me the document and the questions people keep asking about it."
  primaryLabel: "Talk about your documents"
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

There is a worse case. The answer can be right about the passage and wrong about
the number in front of it. A made-up figure sits comfortably next to a real
quote. A résumé cannot afford that error.

So the goal stayed narrow. Let a person ask about my work. Then show the exact
passage that supports the answer.

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
LibSQL store holds the indexed passages. Zod, a schema checker, guards the shape
of every request and reply, so a bad request stops at the edge.

The Mastra packages sit at exact versions. A lockfile and a frozen install keep
each build on the versions I checked.

The code splits along the same line as the problem. One half owns citations,
which covers the PDF source, the page manifest, the figures, and the trust rules.
The other half owns Mastra, which covers indexing, routes, and the request
boundary.

### The file names its own version

The build hashes the PDF with SHA-256, a fingerprint of the exact bytes. That
hash becomes the document id and the content version. Nothing else can mint them.

So a new file is a new version by definition. Edit the résumé and keep the same
filename, and every id still moves. A stale page image cannot quietly claim to
match a document it no longer belongs to.

A build step then reads the text and the text boxes with poppler, a PDF toolkit,
and writes a manifest. That manifest holds 24 passages, 86 quoted spans, and the
size of all 3 pages. Pages render at a fixed 144 DPI, so stored boxes stay
comparable across rebuilds.

### Well formed is not the same as true

Serving reads that manifest and does not trust it. A person can hand edit a
manifest and keep it valid. A person can also swap the PDF after the manifest was
trusted once.

So every call hashes both files again. A cached result only means the manifest
and the PDF are byte for byte what was fully checked before. Page images sit
outside that cache key, so they are hashed again on every single call.

Publishing is one rename. New page images build in a staging folder, and that
folder is moved into place in one step. The manifest is written to a temporary
file and renamed the same way. A reader never sees half a page set. A build that
fails leaves nothing behind.

### When not to search

The usual move is to chop the document up and search it every time. This one
asks a question first. Does the whole thing fit?

Search exists to make a large document fit. It is not a goal on its own. A
three-page résumé fits whole under a budget of 24,000 characters, and picking a
subset from it can only drop evidence. That is how a question like which role
lasted longest gets answered from six of eight roles.

So under the budget the service sends every passage, in document order. Order
matters, because comparing roles needs them the way they were written. Over the
budget, search comes back on.

When search does run it returns ids and nothing else. Each id is looked up in the
manifest. Search results can never invent a passage the source does not hold.

A follow-up gets one more step. A message like "what about after that" carries
almost no words worth searching. The service rewrites it into a standalone
question first, using the last 6 turns. If that rewrite comes back empty, too
long, or with nothing searchable in it, the original question is used instead.

### Citations are not the model's to hand out

The model marks each sentence with the id of the passage it used. Those marks are
claims, not citations.

Every mark is checked twice. The id has to resolve in the manifest, and it has to
be one of the passages the model was actually shown. Anything else is dropped and
recorded as rejected. Reader-style marks the model invents on its own, like [2],
are stripped before the check runs. What survives is renumbered [1], [2] in the
order it first appears.

So a made-up id cannot become a source card. It becomes a rejected id.

### Numbers get checked without a second model call

Retrieval proves a passage is real. It does not prove the sentence in front of it
follows from that passage. A model can quote a real line and still invent the
figure beside it.

Numbers are cheap to check, so the service checks them. It splits the answer into
claims. For each claim that cites something, it gathers every number in the
passages that claim points to. Any number in the claim that is missing from those
passages counts as unsupported. The marks come off, so the sentence is no longer
shown as evidenced, and the number is reported back with the reply.

There is no second model call and no added cost. It is a comparison.

### The highlight shows only what the answer used

A retrieved chunk can cover several unrelated lines. Lighting up all of it would
overstate what the answer leaned on.

So each span is scored against the answer. A span stays when at least half its
content words show up in the sentences carrying that citation's mark. Only those
sentences count, so an unrelated claim cannot light up a span it never used. If
no span clears the bar, the whole quote stays. A narrow guess is worse than a
wide truth.

When spans are skipped, the quote joins the rest with an ellipsis. It never
stitches two far apart lines into one smooth sentence.

The box rules are strict as well. Boxes are stored as fractions of the page, so
they survive any render size. A box outside the page is rejected. A box with no
width or height is rejected. A box covering the whole page is rejected too,
because highlighting everything points at nothing.

### Controlled failure states

An empty question is rejected at the request boundary with a clear error. So is
anything past 1,000 characters. The interface also names states for rate limits,
a missing résumé, search trouble, and a failed model call.

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
the boxes that crop a passage. The image drift test catches a page image that no
longer matches the source it claims to show. Both protect one promise. The crop a
reader sees is the passage the answer used.

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

The number check only covers numbers. A false claim written in words alone will
pass it. The span score is a word overlap test, not a reading of meaning, so it
can keep a span that merely shares vocabulary.

One public run is not a benchmark. Real answer checks still need a fixed question
set, expected source passages, and repeated results over time.

So the proof today is small and specific. A reader can ask one question, read the
answer, and see the exact part of the résumé behind it.
