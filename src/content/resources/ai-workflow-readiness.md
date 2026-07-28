---
kind: resource
format: checklist
slug: ai-workflow-readiness
visibility: public
owner: ryan
title: AI Workflow Readiness Checklist
description: A plain checklist for deciding if repeated work is ready for an AI assisted workflow.
pillar: ai-workflow-systems
intents:
  - implementation
audience:
  - founder
  - operator
---

Use this before you pick a model or tool. Start with one job that keeps coming back. If you cannot describe the work yet, that is the first thing to fix.

## Name the trigger

- The work starts from an event you can point to.
- The same kind of result is needed each time.
- The job happens often enough to learn from.

If the trigger changes every time, keep watching the work before you automate it.

## Gather the context

- The source files and facts are known.
- The system can tell which source it may trust.
- Private data has a clear boundary.
- Missing facts stop the run or send it to a person.

A prompt cannot repair a missing source boundary.

## Set the check

- A person can describe a good result.
- The output can be checked before it moves on.
- The system shows what it used and what it changed.
- A failed check does not pass as finished work.

## Plan the handoff

- One person owns review.
- Odd cases have somewhere to go.
- A failed run leaves enough detail to try again.
- Someone else can follow the notes without rebuilding the whole brief.

## Read the result

If every group is clear, the work may be ready for a small test. If one group is weak, fix that boundary first. The next step may be an agent, a script, a review step, or no automation at all.
