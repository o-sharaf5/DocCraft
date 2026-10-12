"use client";

import {
  FileDown,
  Image as ImageIcon,
  ClipboardCopy,
  Download,
  Palette,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEME_LIST, type ThemeId } from "@/lib/themes";
import type { SaveStatus } from "@/lib/use-draft";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  onExportJpg: () => void;
  onCopyHtml: () => void;
  onDownloadMarkdown: () => void;
  status: SaveStatus;
  busy: null | "pdf" | "png" | "jpg";
}

function Divider() {
  return <div className="mx-1.5 hidden h-6 w-px bg-border sm:block" />;
}

export default function Toolbar({
  themeId,
  onThemeChange,
  onExportPdf,
  onExportPng,
  onExportJpg,
  onCopyHtml,
  onDownloadMarkdown,
  status,
  busy,
}: ToolbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_2px_8px_rgba(37,99,235,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]">
          <FileDown className="h-4 w-4 text-white" />
        </span>
        <div className="leading-tight">
          <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
            DocCraft
          </h1>
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            Markdown → PDF · Image · HTML
          </p>
        </div>
      </div>

      <Divider />

      {/* Theme picker */}
      <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-surface-2/60 py-1 pl-2.5 pr-1">
        <Palette className="h-3.5 w-3.5 text-muted-foreground" />
        <Select value={themeId} onValueChange={(v) => onThemeChange(v as ThemeId)}>
          <SelectTrigger className="h-7 w-[132px] px-1.5 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_LIST.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                    style={{ background: t.swatch }}
                  />
                  {t.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Autosave status */}
      <span
        className={cn(
          "hidden items-center gap-1.5 text-xs lg:flex",
          status === "saved" ? "text-emerald-400" : "text-muted-foreground"
        )}
      >
        {status === "saved" ? (
          <>
            <Check className="h-3.5 w-3.5" /> Draft saved
          </>
        ) : status === "typing" ? (
          <>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
            Saving…
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            Ready
          </>
        )}
      </span>

      {/* Export actions */}
      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" variant="ghost" onClick={onCopyHtml} title="Copy rendered HTML to clipboard">
          <ClipboardCopy className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Copy HTML</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={onDownloadMarkdown} title="Download raw .md file">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden md:inline">.md</span>
        </Button>

        <Divider />

        <div className="flex items-center rounded-lg border border-border/70 bg-surface-2/60 p-0.5">
          <Button
            size="xs"
            variant="ghost"
            className="h-7 rounded-md text-muted-foreground"
            onClick={onExportPng}
            disabled={busy !== null}
            title="Export preview as PNG"
          >
            {busy === "png" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
            PNG
          </Button>
          <Button
            size="xs"
            variant="ghost"
            className="h-7 rounded-md text-muted-foreground"
            onClick={onExportJpg}
            disabled={busy !== null}
            title="Export preview as JPEG"
          >
            {busy === "jpg" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
            JPG
          </Button>
        </div>

        <Button size="sm" onClick={onExportPdf} disabled={busy !== null}>
          {busy === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Export PDF
        </Button>
      </div>
    </header>
  );
}
