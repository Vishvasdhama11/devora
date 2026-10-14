"use client";

import { useMemo, useState } from "react";
import { GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GitTool() {
  const [branch, setBranch] = useState("feature/devora-tooling");
  const [message, setMessage] = useState("feat: add devora tooling");

  const command = useMemo(() => {
    return `git checkout -b ${branch}\ngit add .\ngit commit -m "${message}"\ngit push -u origin ${branch}`;
  }, [branch, message]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Git Command Generator</CardTitle>
        <GitBranch className="h-4 w-4 text-zinc-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input value={branch} onChange={(e) => setBranch(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" placeholder="Branch name" />
          <input value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" placeholder="Commit message" />
        </div>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 p-3 font-mono text-sm text-violet-200">{command}</pre>
        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(command)}>Copy command</Button>
      </CardContent>
    </Card>
  );
}
