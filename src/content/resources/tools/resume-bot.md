---
kind: resource
format: tool
slug: resume-bot
visibility: noindex
owner: ryan
title: Résumé Bot
description: A resume helper in development. It reads PDF text and cites the pages it used.
pillar: context-knowledge-systems
intents:
  - implementation
audience:
  - founder
  - operator
  - technical-reader
---

## Purpose

The bot is being built to answer questions from a resume and point back to the
pages that support an answer.

## Current capability

The separate Mastra project can read PDF text, find matching passages, and carry
page numbers into answers. It also has a citation bundle for the current resume.

## Limits

The bot is not deployed or linked to this site. There is no public chat or web
contract yet. Model keys stay outside the Astro build.
