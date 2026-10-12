"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditorPane from "@/components/editor-pane";
import PreviewPane from "@/components/preview-pane";
import Toolbar from "@/components/toolbar";
import { exportImage, exportPdf } from "@/lib/export";
import { STARTER_MARKDOWN, renderMarkdown, titleFromMarkdown } from "@/lib/markdown";
import { THEMES, type ThemeId } from "@/lib/themes";
import { persistTheme, readTheme, useDraftAutosave } from "@/lib/use-draft";

function useDocStats(markdown: string) {
  return useMemo(() => {
    const words = (markdown.match(/\S+/g) ?? []).length;
    const chars = markdown.length;
    const lines = markdown ? markdown.split("\n").length : 0;
    const readMin = Math.max(1, Math.ceil(words / 200));
    return { words, chars, lines, readMin };
  }, [markdown]);
}

export default function Home() {
  const { markdown, update, status } = useDraftAutosave();
  const [themeId, setThemeId] = useState<ThemeId>("clean");
  const [busy, setBusy] = useState<null | "pdf" | "png" | "jpg">(null);
  const [toast, setToast] = useState<string | null>(null);
  const previewRef = useRef<HTMLElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = THEMES[themeId];
  const stats = useDocStats(markdown);

  // Restore theme + seed the starter doc when no saved draft exists.
  useEffect(() => {
    const savedTheme = readTheme();
    if (savedTheme && savedTheme in THEMES) setThemeId(savedTheme as ThemeId);
    const stored = localStorage.getItem("doccraft-draft");
    if (!stored) update(STARTER_MARKDOWN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const runExport = useCallback(
    async (kind: "pdf" | "png" | "jpg") => {
      const node = previewRef.current;
      if (!node || busy) return;
      setBusy(kind);
      // Relax the scroll container so html2canvas measures full document height.
      const scroller = document.getElementById("dc-scroll");
      scroller?.classList.add("dc-exporting");
      node.classList.add("dc-exporting");
      try {
        const name = titleFromMarkdown(markdown);
        if (kind === "pdf") await exportPdf(node, name, theme.exportBackground);
        else await exportImage(node, name, theme.exportBackground, kind === "jpg" ? "jpeg" : "png");
        showToast(`${kind.toUpperCase()} exported`);
      } catch (err) {
        console.error(err);
        showToast("Export failed — check the console");
      } finally {
        scroller?.classList.remove("dc-exporting");
        node.classList.remove("dc-exporting");
        setBusy(null);
      }
    },
    [markdown, theme, busy, showToast]
  );

  const handleCopyHtml = useCallback(async () => {
    await navigator.clipboard.writeText(renderMarkdown(markdown));
    showToast("HTML copied to clipboard");
  }, [markdown, showToast]);

  const handleDownloadMarkdown = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titleFromMarkdown(markdown)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Markdown downloaded");
  }, [markdown, showToast]);

  const handleThemeChange = useCallback((id: ThemeId) => {
    setThemeId(id);
    persistTheme(id);
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Toolbar
        themeId={themeId}
        onThemeChange={handleThemeChange}
        onExportPdf={() => runExport("pdf")}
        onExportPng={() => runExport("png")}
        onExportJpg={() => runExport("jpg")}
        onCopyHtml={handleCopyHtml}
        onDownloadMarkdown={handleDownloadMarkdown}
        status={status}
        busy={busy}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <EditorPane value={markdown} onChange={update} />
        <PreviewPane ref={previewRef} markdown={markdown} theme={theme} />
      </main>

      {/* Status bar */}
      <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-border bg-surface px-4 text-[11px] text-muted-foreground">
        <span className="font-mono">{stats.words.toLocaleString()} words</span>
        <span className="hidden font-mono sm:inline">{stats.chars.toLocaleString()} chars</span>
        <span className="hidden font-mono md:inline">{stats.lines} lines</span>
        <span className="ml-auto font-mono">{stats.readMin} min read</span>
        <span className="hidden lg:inline">UTF-8 · Markdown</span>
      </footer>

      {toast && (
        <div className="dc-toast fixed bottom-11 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-border bg-popover px-4 py-2 text-sm text-popover-foreground shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {toast}
        </div>
      )}
    </div>
  );
}
