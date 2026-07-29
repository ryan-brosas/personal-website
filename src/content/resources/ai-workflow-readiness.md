---
kind: resource
format: checklist
slug: ai-workflow-readiness
visibility: public
owner: ryan
title: AI Workflow Readiness Checklist
description: Sixteen checks that show whether one repeated job is ready to automate, and which boundary to fix when it is not.
pillar: ai-workflow-systems
intents:
  - implementation
audience:
  - founder
  - operator
---

You have a job that comes back every week. It eats hours, it is never quite the
same twice, and someone keeps asking whether AI could just handle it.

This answers that for one job at a time. It can also tell you to build nothing,
which is the right answer more often than most tool pages admit.

Pick one job before you start. Not a department, not a goal. One piece of work
with a beginning and an end. Then tick only what is true today, not what you plan
to fix. Count your ticks at the end.

## Name the trigger

- The work starts from an event you can point to.
- You can name who asks for it and who receives it.
- The same kind of result is needed each time.
- The job happens often enough to learn from.

A job with no clear start has no clear finish either. If the trigger changes
every time, keep watching the work for a few more weeks before you automate it.

## Gather the context

- The source files and facts are known.
- The system can tell which source it may trust.
- Private data has a clear boundary.
- Missing facts stop the run or send it to a person.

This is where most builds go wrong. A prompt cannot repair a missing source
boundary. If the model has to guess where a fact came from, it will guess, and a
confident wrong answer costs more than no answer.

## Set the check

- A person can describe a good result.
- The output can be checked before it moves on.
- The system shows what it used and what it changed.
- A failed check does not pass as finished work.

If nobody can say what good looks like, nobody can tell when it breaks. Work out
the check before the build, because a check added later tends to be shaped around
whatever the system already does.

## Plan the handoff

- One person owns review.
- Odd cases have somewhere to go.
- A failed run leaves enough detail to try again.
- Someone else can follow the notes without rebuilding the whole brief.

Automation that only one person understands is a risk, not a saving. The job has
to survive that person taking a week off.

## Read your score

Count the boxes you ticked honestly.

**14 to 16.** The job is ready for a small test. Build the narrowest version that
does one real run end to end, and keep the review step.

**9 to 13.** One boundary is weak. Find the group with the most gaps and fix that
first. Building now means building on the part you already know is soft.

**8 or fewer.** This is not an automation problem yet. The work is still being
figured out. Write down how it actually runs today, do it by hand a few more
times, and come back.

A low score is a useful result. It costs a few minutes here instead of a few
weeks of building.

## What this looks like when it is done right

Each of these is a live thing you can open and check.

A source boundary that holds is what makes an answer worth trusting. The
[résumé bot](/case-studies/mastra-resume-bot/) shows the exact page and passage
behind every answer, and says the document does not cover it rather than filling
the gap.

A private data boundary has to be enforced, not remembered. The
[telemetry dashboard](/case-studies/pi-telemetry-dashboard/) publishes what my
agents cost while a guard blocks any prompt text from leaving the machine, and
the feed is public so the claim can be tested.

A check that fails loudly beats a check that is polite. This site
[refuses to build](/case-studies/this-site/) when a public claim has no evidence
behind it.

## If you want a second read

Bring your score and the group that scored worst. The next step might be an
agent, a script, a review step, or nothing at all, and it is worth knowing which
before anyone starts building.
