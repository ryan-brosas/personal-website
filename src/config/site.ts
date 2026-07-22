// M2 (Plan 03, Child 1) code-controlled page configuration.
// Owns page IDs (matching src/content/pages/<id>.md), route paths, and
// navigation order. Root "/" is code-owned (no Home record) and activated as
// noindex in Child 2 (m2-semantic-shell). The settings singleton owns the
// human-readable labels; this module owns the structural contract.

export interface PageConfig {
  /** Content collection entry ID (matches src/content/pages/<id>.md). */
  id: string;
  /** HTML route path (trailing slash per the canonical route contract). */
  path: string;
  /** Key into SettingsData.navLabels for this page's nav label. */
  navLabelKey: "about" | "services" | "contact";
}

export const PAGES: PageConfig[] = [
  { id: "about", path: "/about/", navLabelKey: "about" },
  { id: "services", path: "/services/", navLabelKey: "services" },
  { id: "contact", path: "/contact/", navLabelKey: "contact" },
];

/** Navigation order (by page id). Root is code-owned and prepended by the shell. */
export const NAV_ORDER: string[] = ["about", "services", "contact"];
