"use client";

import { useState } from "react";
import { Copy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UuidGenerator() {
  const [value, setValue] = useState("tbd");

  const generate = () => {
    setValue(crypto.randomUUID());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>UUID Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-sm text-violet-200">{value}</div>
        <div className="flex gap-2">
          <Button onClick={generate}><Plus className="h-4 w-4" /> Generate</Button>
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(value)}><Copy className="h-4 w-4" /> Copy</Button>
        </div>
      </CardContent>
    </Card>
  );
}
