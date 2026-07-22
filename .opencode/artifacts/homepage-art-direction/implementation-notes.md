# P02A Implementation Notes

## Baseline

Baseline SHA-256: 8cf4d4023f662b6f56ddb046ee2c5df8b82e1d308d67ddd9a2fd3d7042e0ef58

Canonical and showcase were byte-identical at first entry (`entry mode: initialize`).

## Deviations

- The first delegated build-agent pass for Task 1 returned no result and made no file changes. The prototype is implemented directly in this session instead. Approach and contract are unchanged.

## Discoveries

- The canonical page is a single self-contained HTML file: inline `<style>` (lines 9-237), inline `<script>` IIFE (lines 367-384), body 239-385. It loads `tokens.css` externally for the brand token system.
- The mobile-nav bug is exactly as documented: at `<=820px` the `.primary-nav` is `display: none` unless `data-open="true"`, and only the JS click handler can set that attribute. Without JS, mobile visitors lose every primary link.
- The System Conductor hero image is a raster (`1254 × 1254` source). A signal-trace overlay must be fitted to the image's rendered box, not absolute source coordinates, to stay aligned across responsive breakpoints.

## Optional motion APIs

Optional motion APIs: none
