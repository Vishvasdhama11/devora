"use client";

import { useMemo, useState } from "react";
import { Link2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function UrlTool() {
  const [url, setUrl] = useState("https://devora.dev/tools?tab=regex&source=dev");

  const parsed = useMemo(() => {
    try {
      const value = new URL(url);
      return {
        protocol: value.protocol,
        host: value.host,
        pathname: value.pathname,
        search: value.search,
        hash: value.hash,
        origin: value.origin,
        params: Object.fromEntries(value.searchParams.entries()),
      };
    } catch {
      return null;
    }
  }, [url]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>URL Parser</CardTitle>
          <div className="flex items-center gap-2 text-xs text-zinc-400"><Link2 className="h-4 w-4" /> URL analysis</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          <div className="grid gap-3 md:grid-cols-2">
            {parsed ? (
              <>
                <div className="rounded-xl border border-white/10 bg-zinc-950 p-3"><div className="text-xs text-zinc-400">Origin</div><div className="font-mono text-sm text-white">{parsed.origin}</div></div>
                <div className="rounded-xl border border-white/10 bg-zinc-950 p-3"><div className="text-xs text-zinc-400">Protocol</div><div className="font-mono text-sm text-white">{parsed.protocol}</div></div>
                <div className="rounded-xl border border-white/10 bg-zinc-950 p-3"><div className="text-xs text-zinc-400">Path</div><div className="font-mono text-sm text-white">{parsed.pathname}</div></div>
                <div className="rounded-xl border border-white/10 bg-zinc-950 p-3"><div className="text-xs text-zinc-400">Hash</div><div className="font-mono text-sm text-white">{parsed.hash || "(none)"}</div></div>
              </>
            ) : (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">Please provide a valid absolute URL.</div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-950 p-3">
            <div className="mb-2 flex items-center gap-2 text-zinc-300"><Search className="h-4 w-4" /> Query params</div>
            <pre className="overflow-x-auto text-sm text-violet-200">{parsed ? JSON.stringify(parsed.params, null, 2) : "{}"}</pre>
          </div>

          <Button variant="secondary" onClick={() => setUrl("https://devora.dev/tools?tab=regex&source=dev")}>
            Reset sample
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
