"use client";

import { useMemo, useState } from "react";
import { Clock3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TimeTool() {
  const [timestamp, setTimestamp] = useState("1712524800");

  const result = useMemo(() => {
    const value = Number(timestamp);
    if (Number.isNaN(value)) return "Invalid timestamp";
    const date = new Date(value * 1000);
    return date.toLocaleString();
  }, [timestamp]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Unix Timestamp Converter</CardTitle>
        <Clock3 className="h-4 w-4 text-zinc-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Input value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="Unix timestamp" />
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-100">{result}</div>
      </CardContent>
    </Card>
  );
}
