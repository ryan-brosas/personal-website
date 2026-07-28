/// <reference types="astro/client" />

// Minimal ambient declarations for the Node builtins used by home-proof.ts.
// @types/node is intentionally not a project dependency.
declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf-8"): string;
}


declare module "node:url" {
  export function fileURLToPath(url: URL | string): string;
}
