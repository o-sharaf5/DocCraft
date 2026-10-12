"use client";

import { useCallback, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView, keymap } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Prec } from "@codemirror/state";
import { tags as t } from "@lezer/highlight";
import {
  Bold,
  Italic,
  Code,
  Braces,
  List,
  ListOrdered,
  Quote,
  Table,
  Link as LinkIcon,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorPaneProps {
  value: string;
  onChange: (next: string) => void;
}

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "transparent",
    color: "#d4d9e3",
    fontSize: "13.5px",
  },
  ".cm-content": {
    caretColor: "#60a5fa",
    padding: "1.25rem 0",
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#60a5fa", borderLeftWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "rgba(59, 130, 246, 0.28)",
  },
  ".cm-activeLine": { backgroundColor: "rgba(255, 255, 255, 0.025)" },
  ".cm-gutters": { display: "none" },
  ".cm-lineNumbers": { display: "none" },
});

const mdHighlight = HighlightStyle.define([
  { tag: t.heading1, color: "#f2f4f8", fontWeight: "700", fontSize: "1.25em" },
  { tag: t.heading2, color: "#e7eaf0", fontWeight: "700", fontSize: "1.1em" },
  { tag: [t.heading3, t.heading4, t.heading5, t.heading6], color: "#dde2ea", fontWeight: "600" },
  { tag: t.strong, color: "#f2f4f8", fontWeight: "700" },
  { tag: t.emphasis, color: "#cdd4e0", fontStyle: "italic" },
  { tag: t.link, color: "#60a5fa", textDecoration: "underline" },
  { tag: t.url, color: "#60a5fa" },
  { tag: t.monospace, color: "#f0abfc" },
  { tag: t.contentSeparator, color: "#5b6472" },
  { tag: t.quote, color: "#94a3b8", fontStyle: "italic" },
  { tag: t.list, color: "#fbbf24" },
  { tag: t.meta, color: "#5b6472" },
  { tag: t.processingInstruction, color: "#5b6472" },
]);

/* ---- text manipulation helpers (operate on the live EditorView) ---- */

function wrapSelection(view: EditorView, before: string, after: string, placeholder: string) {
  const { from, to } = view.state.selection.main;
  if (from === to) {
    view.dispatch({
      changes: { from, to, insert: before + placeholder + after },
      selection: { anchor: from + before.length, head: from + before.length + placeholder.length },
    });
  } else {
    const text = view.state.sliceDoc(from, to);
    view.dispatch({
      changes: { from, to, insert: before + text + after },
      selection: { anchor: from + before.length, head: from + before.length + text.length },
    });
  }
  view.focus();
}

function prefixLines(view: EditorView, prefix: string | ((i: number) => string)) {
  const { from, to } = view.state.selection.main;
  const lineFrom = view.state.doc.lineAt(from).number;
  const lineTo = view.state.doc.lineAt(to).number;
  const changes = [];
  for (let i = lineFrom; i <= lineTo; i++) {
    const line = view.state.doc.line(i);
    const p = typeof prefix === "function" ? prefix(i - lineFrom) : prefix;
    changes.push({ from: line.from, insert: p });
  }
  view.dispatch({ changes });
  view.focus();
}

function insertBlock(view: EditorView, block: string) {
  const { from, to } = view.state.selection.main;
  const text = from === to ? "" : view.state.sliceDoc(from, to);
  const insert = text ? block.replace("$SELECTION", text) : block.replace("$SELECTION", "");
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + insert.length },
  });
  view.focus();
}

interface ToolAction {
  icon: React.ReactNode;
  label: string;
  run: (view: EditorView) => void;
}

const ACTIONS: ToolAction[] = [
  { icon: <Bold className="h-4 w-4" />, label: "Bold (Ctrl/Cmd+B)", run: (v) => wrapSelection(v, "**", "**", "bold text") },
  { icon: <Italic className="h-4 w-4" />, label: "Italic (Ctrl/Cmd+I)", run: (v) => wrapSelection(v, "_", "_", "italic text") },
  { icon: <Code className="h-4 w-4" />, label: "Inline code (Ctrl/Cmd+E)", run: (v) => wrapSelection(v, "`", "`", "code") },
  { icon: <Braces className="h-4 w-4" />, label: "Code block", run: (v) => insertBlock(v, "```\n$SELECTION\n```") },
  { icon: <Quote className="h-4 w-4" />, label: "Blockquote", run: (v) => prefixLines(v, "> ") },
  { icon: <List className="h-4 w-4" />, label: "Bullet list", run: (v) => prefixLines(v, "- ") },
  { icon: <ListOrdered className="h-4 w-4" />, label: "Numbered list", run: (v) => prefixLines(v, (i) => `${i + 1}. `) },
  {
    icon: <Table className="h-4 w-4" />,
    label: "Insert table",
    run: (v) => insertBlock(v, "| Column | Column |\n| ------ | ------ |\n| Cell   | Cell   |"),
  },
  { icon: <LinkIcon className="h-4 w-4" />, label: "Link", run: (v) => wrapSelection(v, "[", "](https://)", "link text") },
];

export default function EditorPane({ value, onChange }: EditorPaneProps) {
  const viewRef = useRef<EditorView | null>(null);

  const action = useCallback((i: number) => {
    if (viewRef.current) ACTIONS[i].run(viewRef.current);
  }, []);

  const shortcuts = Prec.high(
    keymap.of([
      { key: "Mod-b", run: () => { action(0); return true; } },
      { key: "Mod-i", run: () => { action(1); return true; } },
      { key: "Mod-e", run: () => { action(2); return true; } },
    ])
  );

  return (
    <section className="flex h-full min-h-0 flex-col border-r border-border bg-[#0d1017]">
      {/* Pane header */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border/70 bg-surface/60 px-3">
        <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Markdown
        </span>
        <span className="ml-auto hidden text-[11px] text-muted-foreground/70 xl:inline">
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px]">Ctrl B</kbd>
          {" · "}
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px]">Ctrl I</kbd>
          {" · "}
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px]">Ctrl E</kbd>
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex h-10 shrink-0 items-center gap-0.5 border-b border-border/70 px-2">
        {ACTIONS.map((a, i) => (
          <Button
            key={a.label}
            variant="ghost"
            size="icon"
            title={a.label}
            aria-label={a.label}
            className="h-7 w-7 rounded-md text-muted-foreground hover:bg-white/[0.07] hover:text-foreground"
            onClick={() => action(i)}
          >
            {a.icon}
          </Button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        <CodeMirror
          value={value}
          height="100%"
          style={{ height: "100%" }}
          theme={editorTheme}
          onChange={onChange}
          onCreateEditor={(view) => {
            viewRef.current = view;
          }}
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            syntaxHighlighting(mdHighlight),
            shortcuts,
          ]}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: true,
            bracketMatching: false,
            closeBrackets: false,
          }}
        />
      </div>
    </section>
  );
}
