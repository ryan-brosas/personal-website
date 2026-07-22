// Markdown body safety guard.
// RED stub: no-op. GREEN implements the real dependency-free guard.
//
// Astro 5.18.2 hardcodes allowDangerousHtml:true in @astrojs/markdown-remark
// and runs user rehypePlugins BEFORE rehypeRaw. So this plugin sees `raw` hast
// nodes (raw HTML) and normal `element` nodes (links). It throws on raw nodes,
// on* event properties, and javascript:/data: protocols.
//
// The glob() loader catches renderer exceptions and stores rendered:undefined.
// assertMarkdownRendered() makes that swallowed error fatal by requiring
// entry.rendered.html to be a string before the page renders it.

// Local structural HAST types (dependency-free; no hast/unified imports).
export interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
}

// RED: no-op rehype plugin. GREEN throws on unsafe nodes.
export default function markdownSafety() {
  return (_tree: HastNode) => {
    // RED: intentionally does nothing.
  };
}

// RED: no-op render assertion. GREEN requires rendered.html string.
export function assertMarkdownRendered(_entry: { rendered?: { html?: string } }): void {
  // RED: intentionally does nothing.
}
