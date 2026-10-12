"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DRAFT_KEY = "doccr…raft";
const THEME_KEY = "doccr…heme";

interface Draft {
  markdown: string;
  savedAt: number;
}

function readDraft(): string {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return "";
    return (JSON.parse(raw) as Draft).markdown ?? "";
  } catch {
    return "";
  }
}

export type SaveStatus = "idle" | "typing" | "saved";

/**
 * Debounced localStorage autosave for the editor.
 * Loads the persisted draft once on mount, then saves ~700ms after typing stops.
 */
export function useDraftAutosave(delayMs = 700) {
  const [markdown, setMarkdown] = useState<string>("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  // Load once on mount (client only -> no hydration mismatch).
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    setMarkdown(readDraft());
  }, []);

  const update = useCallback(
    (value: string) => {
      setMarkdown(value);
      setStatus("typing");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try {
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ markdown: value, savedAt: Date.now() } satisfies Draft)
          );
          setStatus("saved");
        } catch {
          // Storage full / private mode: keep the session working.
          setStatus("idle");
        }
      }, delayMs);
    },
    [delayMs]
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { markdown, update, setMarkdown, status };
}

export function persistTheme(id: string) {
  try {
    localStorage.setItem(THEME_KEY, id);
  } catch {
    /* ignore */
  }
}

export function readTheme(): string | null {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}
