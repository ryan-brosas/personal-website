---
kind: wiki
slug: failure-modes
visibility: public
owner: ryan
title: Failure modes
description: A failure mode is a way a system can break.
pillar: agent-reliability
---

Naming them ahead of time helps you catch them before they do harm.

Common modes for agents are loops that never end, tools called with bad inputs, and confident wrong answers. Each one has a shape you can plan for.

List the ways your system can fail. Add a check or a stop for each one. A system with no named failure modes will surprise you at the worst time.
