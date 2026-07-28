---
kind: wiki
slug: agent-loops
visibility: public
owner: ryan
title: Agent loops
description: An agent loop is the repeated cycle an agent runs to finish a job.
pillar: ai-workflow-systems
---

It looks at the task, picks a step, does the step, then checks the result. Then it starts again until the job is done.

Each turn uses the same pattern. Observe, decide, act, check. A good loop stops when the goal is met or when the agent gets stuck.

A loop that runs too long can cost money and make mistakes. Set a limit on steps and a clear way to stop. A loop without an exit is a bug.
