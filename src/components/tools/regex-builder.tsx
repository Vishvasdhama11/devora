"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const templates = {
  Email: /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/,
  URL: /https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?/i,
  Phone: /^\+?[0-9()\-\s]{7,}$/,
  IP: /^(?:\d{1,3}\.){3}\d{1,3}$/,
  Date: /^\d{4}-\d{2}-\d{2}$/,
};

export function RegexBuilder() {
  const [pattern, setPattern] = useState("[A-Z]{3}-\\d{4}");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("DEV-1234, ABC-9876");

  const matches = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags);
      return Array.from(text.matchAll(regex)).map((match) => ({
        value: match[0],
        groups: match.slice(1),
      }));
    } catch {
      return [];
    }
  }, [flags, pattern, text]);

  const explanation = useMemo(() => {
    if (!pattern) return "Enter a pattern to generate a quick explanation.";
    return `Pattern ${pattern} is evaluated with flags "${flags || "none"}" and compared against the test string.`;
  }, [flags, pattern]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Regex Builder</CardTitle>
          <div className="flex items-center gap-2 text-xs text-zinc-400"><Search className="h-4 w-4" />Regex engine</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1.6fr_0.6fr]">
            <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Pattern" />
            <Input value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="Flags" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Test string</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-36 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Explanation</label>
              <div className="min-h-36 rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-300">
                {explanation}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(templates).map(([name, regex]) => (
              <Button key={name} variant="secondary" size="sm" onClick={() => { setPattern(regex.source); setText(name === "Email" ? "hello@example.com" : name === "URL" ? "https://devora.dev/tools" : name === "Phone" ? "+1 (555) 123-4567" : name === "IP" ? "127.0.0.1" : "2024-10-13"); }}>
                {name}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-sm text-zinc-300">Matches</div>
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-200">
              {matches.length === 0 ? "No matches yet." : matches.map((match, index) => (
                <div key={`${match.value}-${index}`} className="mb-2 border-b border-white/5 pb-2 last:border-0">
                  <div className="font-mono text-violet-300">{match.value}</div>
                  {match.groups.length > 0 && <div className="text-xs text-zinc-400">Groups: {match.groups.join(", ")}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-violet-200">
            <Sparkles className="h-4 w-4" />
            Processed locally in your browser.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
