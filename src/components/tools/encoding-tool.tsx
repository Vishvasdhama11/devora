"use client";

import { useState } from "react";
import { Copy, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EncodingTool() {
  const [input, setInput] = useState("Devora is the modern toolkit for developers.");
  const [mode, setMode] = useState<"base64" | "url" | "html">("base64");
  const [result, setResult] = useState("");

  const encode = () => {
    if (mode === "base64") {
      setResult(btoa(unescape(encodeURIComponent(input))));
    }
    if (mode === "url") {
      setResult(encodeURIComponent(input));
    }
    if (mode === "html") {
      setResult(input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;"));
    }
  };

  const decode = () => {
    if (mode === "base64") {
      try {
        setResult(decodeURIComponent(escape(atob(input))));
      } catch {
        setResult("Invalid Base64 input");
      }
    }
    if (mode === "url") {
      setResult(decodeURIComponent(input));
    }
    if (mode === "html") {
      setResult(input
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Encoding Utility</CardTitle>
          <div className="flex gap-2">
            {(["base64", "url", "html"] as const).map((choice) => (
              <Button key={choice} variant={mode === choice ? "default" : "secondary"} size="sm" onClick={() => setMode(choice)}>
                {choice.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-32 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-100" />
          <div className="flex gap-2">
            <Button onClick={encode}>Encode</Button>
            <Button variant="secondary" onClick={decode}>Decode</Button>
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(result)}><Copy className="h-4 w-4" /> Copy</Button>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-100">
            {result || "Output will appear here."}
          </div>
          <div className="flex items-center gap-2 text-xs text-violet-200">
            <Shuffle className="h-4 w-4" />
            Processed locally in your browser.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
