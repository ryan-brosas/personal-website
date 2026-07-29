---
kind: resource
format: tool
slug: llm-watcher
visibility: public
owner: ryan
title: Telemetry Inspector
description: Inspect pi telemetry files by usage, cost, model, provider, and run.
launchUrl: https://dashboard.ryanjosebrosas.dev/
pillar: agent-reliability
intents:
  - implementation
audience:
  - operator
  - technical-reader
---

## What it does

Load a pi telemetry JSONL file and inspect its data. You can also use sample data
before you add a file.

## What you can inspect

- Usage and cost
- Input, output, and cache reads
- Models and providers
- Recent runs
- Raw data through the SQL view

## Limits

The tool shows data from your file or its sample set. It does not claim to cover
every model or send live alerts.
