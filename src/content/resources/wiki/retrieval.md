---
kind: wiki
slug: retrieval
visibility: public
owner: ryan
title: Retrieval
description: Retrieval means finding the right facts before the model answers.
pillar: context-knowledge-systems
---

You search a store of notes, then give the model only the parts that fit the question.

This keeps the context window small and the facts fresh. The model does not need to hold everything in memory. It reads what you hand it.

Good retrieval depends on good search. If the search misses the right note, the model answers without it. Test your search the same way you test the answer.
