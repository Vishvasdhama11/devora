"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { FileJson, RefreshCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function JsonStudio() {
  const [input, setInput] = useState('{"name":"Devora","features":["JSON","API","Regex"]}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    try {
      const value = JSON.parse(input);
      return {
        size: `${new TextEncoder().encode(JSON.stringify(value)).length} bytes`,
        type: Array.isArray(value) ? "array" : typeof value,
      };
    } catch {
      return { size: "0 bytes", type: "invalid" };
    }
  }, [input]);

  const prettyPrint = () => {
    try {
      const parsed = JSON.parse(input);
      const next = JSON.stringify(parsed, null, 2);
      setOutput(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setOutput("Valid JSON");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const toTypeScript = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(`type JsonValue = ${JSON.stringify(parsed, null, 2)};`);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {
    const blob = new Blob([output || input], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devora-output.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>JSON Studio</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <FileJson className="h-4 w-4" />
            {stats.size} · {stats.type}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button onClick={prettyPrint}>Format</Button>
            <Button variant="secondary" onClick={minify}>Minify</Button>
            <Button variant="secondary" onClick={validate}>Validate</Button>
            <Button variant="secondary" onClick={toTypeScript}>JSON → TS</Button>
            <Button variant="secondary" onClick={handleCopy}>Copy</Button>
            <Button variant="secondary" onClick={handleDownload}>Download</Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-zinc-300">Input</div>
              <div className="h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                <Editor
                  height="320px"
                  theme="vs-dark"
                  language="json"
                  value={input}
                  onChange={(value) => setInput(value ?? "")}
                  options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-zinc-300">Output</div>
              <div className="h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                <Editor
                  height="320px"
                  theme="vs-dark"
                  language="json"
                  value={output || input}
                  options={{ minimap: { enabled: false }, fontSize: 14, readOnly: true, automaticLayout: true }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Input placeholder="Paste sample JSON" value={input} onChange={(e) => setInput(e.target.value)} />
            <Button variant="secondary" onClick={() => setInput('{"project":"devora","status":"ready"}')}>
              <RefreshCcw className="h-4 w-4" />
              Sample
            </Button>
          </div>

          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-200">{error}</div>}

          <div className="flex items-center gap-2 text-xs text-violet-200">
            <Sparkles className="h-4 w-4" />
            Processed locally in your browser.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
