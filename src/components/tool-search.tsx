"use client";

import Link from "next/link";
import { Command, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { TOOL_REGISTRY } from "@/tools/registry";

type ToolSearchProps = {
  compact?: boolean;
  placeholder?: string;
  inline?: boolean;
};

export function ToolSearch({ compact = false, placeholder = "Search JSON, regex, API, CSS, Git...", inline = false }: ToolSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      if (isModifierPressed && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    const source = trimmed
      ? TOOL_REGISTRY.filter((tool) => {
          const haystack = [
            tool.name,
            tool.slug,
            tool.description,
            tool.category,
            tool.tags.join(" "),
            tool.keywords.join(" "),
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(trimmed);
        })
      : TOOL_REGISTRY.slice(0, 8);

    return source;
  }, [query]);

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={compact
        ? "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900"
        : "flex w-full items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-violet-500/40 hover:bg-zinc-900/80"}
    >
      <Search className="h-4 w-4 text-violet-300" />
      <span className="flex-1 truncate">{placeholder}</span>
      {!compact ? <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-zinc-950/80 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-400"><Command className="h-3 w-3" />K</span> : null}
    </button>
  );

  return (
    <>
      {inline ? trigger : trigger}

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-zinc-950/80 p-4 pt-20 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-violet-950/20" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-violet-300" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools, categories, keywords…"
                className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/10 p-1 text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-3">
              {results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/50 p-6 text-center text-sm text-zinc-400">
                  No tools match “{query}”. Try “json”, “regex”, “api”, or “git”.
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-3 text-left transition hover:border-violet-500/40 hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-200">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="font-medium text-white">{tool.name}</div>
                          <div className="text-xs text-zinc-400">{tool.category} · {tool.tags.slice(0, 2).join(" • ")}</div>
                        </div>
                      </div>
                      <span className="text-xs uppercase tracking-[0.18em] text-violet-300">Open</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
