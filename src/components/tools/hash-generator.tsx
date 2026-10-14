"use client";

import { useState } from "react";
import { Copy, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HashGenerator() {
  const [input, setInput] = useState("devora");
  const [hash, setHash] = useState("");

  const generate = async () => {
    const text = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", text);
    const bytes = Array.from(new Uint8Array(digest));
    setHash(bytes.map((b) => b.toString(16).padStart(2, "0")).join(""));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hash Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-32 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-100" />
        <div className="flex gap-2">
          <Button onClick={generate}><ShieldCheck className="h-4 w-4" /> Generate SHA-256</Button>
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(hash)}><Copy className="h-4 w-4" /> Copy</Button>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-3 font-mono text-sm text-violet-200">{hash || "Hash output will appear here."}</div>
      </CardContent>
    </Card>
  );
}
