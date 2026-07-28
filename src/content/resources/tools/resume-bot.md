---
kind: resource
format: tool
slug: resume-bot
visibility: noindex
owner: ryan
title: Résumé Bot
description: A résumé assistant in development, with PDF retrieval and source-linked citation assets kept outside this Astro site.
pillar: context-knowledge-systems
intents:
  - implementation
audience:
  - founder
  - operator
  - technical-reader
---

## Purpose

The bot is being built to answer questions from résumé source material and point
back to the pages that support an answer.

## Current capability

The separate Mastra project can index PDF text, retrieve matching passages, and
carry page numbers into answers. It also has a version-bound citation bundle for
the current résumé source.

## Limits

The bot is not deployed or connected to this website. There is no public chat or
versioned HTTP client contract yet. Model credentials remain outside the Astro
browser build.
