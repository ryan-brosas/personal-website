/// <reference types="astro/client" />

// Minimal ambient shim for the one Node builtin used by a type-checked src/*.ts
// module (src/lib/home-proof.ts reads the tracked self-project case study to
// derive the homepage promotion decision). @types/node is intentionally not a
// dependency, so this declares ONLY the single function actually consumed. The
// Node test runner, Vite/Astro SSG, and the build tooling all provide node:fs at
// runtime; this declaration is type-only and has zero runtime cost.
declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf-8"): string;
}
