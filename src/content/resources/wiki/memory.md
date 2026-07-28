---
kind: wiki
slug: memory
visibility: public
owner: ryan
title: Memory
description: Memory lets an agent keep facts between turns or between runs.
pillar: context-knowledge-systems
---

It can remember what it tried, what worked, and what the user likes.

There are two kinds. Short memory holds the current task. Long memory holds facts from past tasks. Long memory is harder because old facts can go stale.

Write down what you want the agent to recall. Give old facts a way to expire. A memory that never forgets will soon hold things that are no longer true.
