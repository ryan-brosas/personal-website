// Markdown body safety guard (zero-dependency).
//
// Astro 5.18.2 hardcodes allowDangerousHtml:true in @astrojs/markdown-remark
// and runs user rehypePlugins BEFORE rehypeRaw. This plugin sees `raw` hast
// nodes (raw HTML that rehypeRaw would parse) and normal `element` nodes. It
// throws at build time on:
//   - raw nodes                -> markdown-safety: raw-html
//   - case-insensitive on*     -> markdown-safety: event-handler
//   - javascript:/data: href/src/xlinkHref -> markdown-safety: unsafe-protocol
//
// The glob() loader catches renderer exceptions, logs them, and stores
// rendered:undefined. assertMarkdownRendered() makes that swallowed error
// fatal by requiring entry.rendered.html to be a string before the page
// renders it. Both layers are needed: the guard rejects unsafe content, and
// the assertion converts the swallowed rejection into a build failure.

// Local structural HAST types (dependency-free; no hast/unified imports).
export interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
}

const UNSAFE_PROTOCOLS = ["javascript:", "data:"];

function isUnsafeUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim().toLowerCase();
  return UNSAFE_PROTOCOLS.some((p) => trimmed.startsWith(p));
}

function isEventHandler(key: string): boolean {
  // All HTML attributes starting with "on" are event handlers.
  return /^on[a-z]/i.test(key);
}

function walk(node: HastNode): void {
  if (node.type === "raw") {
    throw new Error("markdown-safety: raw-html");
  }
  if (node.type === "element" && node.properties) {
    for (const key of Object.keys(node.properties)) {
      if (isEventHandler(key)) {
        throw new Error("markdown-safety: event-handler");
      }
    }
    if (
      isUnsafeUrl(node.properties.href) ||
      isUnsafeUrl(node.properties.src) ||
      isUnsafeUrl(node.properties.xlinkHref)
    ) {
      throw new Error("markdown-safety: unsafe-protocol");
    }
  }
  if (node.children) {
    for (const child of node.children) {
      walk(child);
    }
  }
}

export default function markdownSafety() {
  return (tree: HastNode) => {
    walk(tree);
  };
}

export function assertMarkdownRendered(entry: { rendered?: { html?: string } }): void {
  if (typeof entry?.rendered?.html !== "string") {
    throw new Error("markdown-safety: render-failed");
  }
}
