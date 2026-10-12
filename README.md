# DocCraft

**A lightning-fast, fully client-side Markdown → PDF / Image / HTML exporter.**

Type Markdown on the left, watch a beautifully styled preview on the right, and export it as a multi-page PDF, high-res PNG/JPEG, or clean HTML — all rendered in the browser. No servers, no uploads, no accounts. Your documents never leave the tab.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square) ![Client-side](https://img.shields.io/badge/100%25-client--side-brightgreen?style=flat-square)

## Features

- **Split-screen workspace** — CodeMirror 6 editor with Markdown syntax highlighting, paired with a real-time `marked` preview
- **Formatting toolbar + shortcuts** — Bold, Italic, Inline code, Code block, Quote, Lists, Tables, Link (`Ctrl/Cmd + B / I / E`)
- **Export bar** — Multi-page A4 PDF (canvas page-slicing, 2× retina scale), PNG/JPEG screenshots, Copy HTML, Download `.md`
- **Three typography themes** — Clean Light, Dark Mode, Minimalist Serif — screen and export are pixel-identical because html2canvas rasterizes the same scoped CSS
- **Local draft autosave** — debounced `localStorage` persistence with a live save indicator; theme choice persists too
- **Status bar** — live word / character / line counts and reading-time estimate

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn-style components (Radix UI) |
| Markdown | `marked` (GFM) + CodeMirror 6 (`@uiw/react-codemirror`) |
| Export | `html2canvas` + `jspdf` — entirely client-side |
| Deploy | Vercel |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Architecture notes

- `lib/export.ts` — the export pipeline: renders the preview node to a 2× canvas, then slices it into A4 page strips for `jsPDF`, so long documents paginate cleanly instead of being squashed onto one page.
- `lib/use-draft.ts` — a debounced autosave hook (700 ms) writing to `localStorage`, loaded once on mount to avoid hydration mismatches.
- `app/globals.css` — preview typography is scoped plain CSS (`.dc-preview.theme-*`) rather than Tailwind utilities, because html2canvas reads computed styles from runtime-generated HTML.
- The preview `<article>` doubles as the export target: before capture, a `dc-exporting` class removes scroll-clipping so the full document height is measured.

## Live demo

**https://doccraft-tau.vercel.app**

## License

MIT
