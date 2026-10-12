"use client";

import { forwardRef, useMemo } from "react";
import { Eye } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import type { DocTheme } from "@/lib/themes";

interface PreviewPaneProps {
  markdown: string;
  theme: DocTheme;
}

/**
 * The preview <article> doubles as the export target: the ref is handed
 * to html2canvas, so the same scoped .dc-preview styles render on screen
 * and inside the exported PDF / image.
 */
const PreviewPane = forwardRef<HTMLElement, PreviewPaneProps>(
  ({ markdown, theme }, ref) => {
    const html = useMemo(() => renderMarkdown(markdown), [markdown]);

    return (
      <section className="flex h-full min-h-0 flex-col bg-[#0a0d13]">
        {/* Pane header */}
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border/70 bg-surface/60 px-3">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Preview
          </span>
          <span className="ml-auto rounded-full border border-border/70 bg-surface-2/70 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {theme.name}
          </span>
        </div>

        {/* Desk canvas */}
        <div id="dc-scroll" className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-5 py-8">
            <article
              ref={ref}
              id="dc-target"
              className={`dc-preview rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)] ${theme.cssClass}`}
              style={{ background: theme.exportBackground }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <p className="pb-2 pt-5 text-center text-[11px] text-muted-foreground/60">
              Exports render exactly what you see
            </p>
          </div>
        </div>
      </section>
    );
  }
);
PreviewPane.displayName = "PreviewPane";

export default PreviewPane;
