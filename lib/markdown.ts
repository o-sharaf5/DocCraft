import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** Render Markdown to an HTML string (GFM: tables, strikethrough, task lists). */
export function renderMarkdown(src: string): string {
  return marked.parse(src, { async: false }) as string;
}

/** Derive a safe download filename from the first heading, or a fallback. */
export function titleFromMarkdown(src: string, fallback = "doccraft-export"): string {
  const m = src.match(/^#\s+(.+)$/m);
  const raw = (m?.[1] ?? fallback)
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return raw || fallback;
}

export const STARTER_MARKDOWN = `# DocCraft

Export **Markdown** to _beautiful_ PDF, images and HTML — entirely in your browser.

## Why it is fast

Everything renders **client-side**. No servers, no uploads, no accounts:

1. Type or paste Markdown on the left
2. Watch the live preview on the right
3. Pick a theme and export

## Feature checklist

- [x] Split-screen editor with syntax highlighting
- [x] Toolbar shortcuts (Bold, Italic, Code, Lists, Tables)
- [x] Real-time preview with 3 typography themes
- [x] Export to multi-page PDF and high-res PNG/JPEG
- [x] Autosave drafts to localStorage

## Quick reference

| Action | Shortcut |
| ------ | -------- |
| Bold | Ctrl/Cmd + B |
| Italic | Ctrl/Cmd + I |
| Inline code | Ctrl/Cmd + E |

\`\`\`ts
import { exportPdf } from "@/lib/export";

await exportPdf(previewNode, "my-doc", "#ffffff");
\`\`\`

> Your drafts never leave the browser tab. That is the whole point.

Happy writing!
`;
