"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function parseMarkdown(md: string) {
  return md
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*? )\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*? )\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />");
}

export function MarkdownTool() {
  const [value, setValue] = useState("# Devora\n\n**The modern toolkit for developers.**\n\n- JSON\n- Regex\n- API tools\n- Git workflows");
  const html = useMemo(() => parseMarkdown(value), [value]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Markdown Preview</CardTitle>
        <div className="flex items-center gap-2 text-xs text-zinc-400"><FileText className="h-4 w-4" /> Rendered</div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <textarea value={value} onChange={(e) => setValue(e.target.value)} className="min-h-80 rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-100" />
        <div className="min-h-80 rounded-xl border border-white/10 bg-zinc-950 p-3 text-zinc-100" dangerouslySetInnerHTML={{ __html: html }} />
      </CardContent>
    </Card>
  );
}
