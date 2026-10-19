"use client";

import { useState } from "react";
import { Copy, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { csvToJson, jsonToCsv } from "@/lib/csv-converter";

type CsvConverterProps = {
  direction: "json-to-csv" | "csv-to-json";
};

const samples = {
  "json-to-csv": '[{"name":"Ada","language":"TypeScript"},{"name":"Lin","language":"Rust"}]',
  "csv-to-json": "name,language\nAda,TypeScript\nLin,Rust",
};

export function CsvConverter({ direction }: CsvConverterProps) {
  const [input, setInput] = useState(samples[direction]);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const isJsonToCsv = direction === "json-to-csv";

  const convert = () => {
    try {
      setOutput(isJsonToCsv ? jsonToCsv(input) : csvToJson(input));
      setError("");
    } catch (conversionError) {
      setOutput("");
      setError(conversionError instanceof Error ? conversionError.message : "Could not convert this input.");
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setError("");
    } catch {
      setError("Clipboard access was denied. Select and copy the output instead.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isJsonToCsv ? "JSON to CSV" : "CSV to JSON"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block space-y-2 text-sm text-zinc-300">
          <span>{isJsonToCsv ? "JSON array of objects" : "CSV with a header row"}</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="min-h-48 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 font-mono text-sm text-zinc-100 outline-none focus:border-violet-500/60"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={convert}>Convert</Button>
          <Button variant="secondary" onClick={() => { setInput(samples[direction]); setOutput(""); setError(""); }}>
            <RefreshCcw className="h-4 w-4" /> Load sample
          </Button>
          <Button variant="secondary" onClick={copyOutput} disabled={!output}>
            <Copy className="h-4 w-4" /> Copy output
          </Button>
        </div>
        {error ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-200">{error}</p> : null}
        <label className="block space-y-2 text-sm text-zinc-300">
          <span>Output</span>
          <textarea
            value={output}
            readOnly
            aria-label="Conversion output"
            className="min-h-48 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 font-mono text-sm text-violet-100 outline-none"
            placeholder="Converted output will appear here."
          />
        </label>
        <p className="text-xs text-zinc-500">Conversion runs locally in your browser. CSV values are kept as text.</p>
      </CardContent>
    </Card>
  );
}

export function JsonToCsvTool() {
  return <CsvConverter direction="json-to-csv" />;
}

export function CsvToJsonTool() {
  return <CsvConverter direction="csv-to-json" />;
}
