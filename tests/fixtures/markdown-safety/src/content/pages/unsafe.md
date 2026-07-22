---
title: "Unsafe"
description: "Unsafe test page exercising the markdown body safety guard"
visibility: draft
---

<script>alert(1)</script>

A paragraph with an event handler attribute:

<img src="x" onerror="alert(1)" alt="unsafe" />

And an unsafe protocol link:

<a href="javascript:alert(1)">click</a>
