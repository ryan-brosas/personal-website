// M2 (Plan 03, Child 1) content-layer schemas. Pure importable module composing
// the policy kernel primitives (publishing.ts) into record schemas consumed by
// both src/content.config.ts (adapter) and Node tests via safeParse.
// Imports astro/zod (Node-resolvable), NOT astro:content (runtime-only).
//
// RED STUB — intentionally permissive. Schema rejection tests must fail before
// the GREEN implementation replaces these.
import { z } from "astro/zod";

export const RecordBase = z.object({}).passthrough();

export const PageSchema = z.object({}).passthrough();
export type PageRecord = z.infer<typeof PageSchema>;

export const SettingsDataSchema = z.any();
export type SettingsData = z.infer<typeof SettingsDataSchema>;
