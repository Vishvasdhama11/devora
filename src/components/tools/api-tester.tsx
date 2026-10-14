"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiTester() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [headers, setHeaders] = useState("{\n  \"Accept\": \"application/json\"\n}");
  const [body, setBody] = useState("{\n  \"title\": \"Devora\"\n}");
  const [response, setResponse] = useState("Run a request to inspect the response.");

  const submit = async () => {
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const responseData = await fetch(url, {
        method,
        headers: parsedHeaders,
        body: method === "GET" || method === "HEAD" ? undefined : body,
      });
      const text = await responseData.text();
      setResponse(`Status: ${responseData.status} ${responseData.statusText}\n\n${text}`);
    } catch (error) {
      setResponse(error instanceof Error ? error.message : "Request failed.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>API Tester</CardTitle>
        <Send className="h-4 w-4 text-zinc-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {['GET','POST','PUT','PATCH','DELETE','HEAD'].map((item) => (
            <Button key={item} variant={method === item ? "default" : "secondary"} size="sm" onClick={() => setMethod(item)}>{item}</Button>
          ))}
        </div>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" placeholder="https://example.com" />
        <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} className="min-h-24 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-100" placeholder="Headers JSON" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-28 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-zinc-100" placeholder="Body JSON" />
        <Button onClick={submit}>Send request</Button>
        <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-zinc-950 p-3 text-xs text-zinc-100">{response}</pre>
      </CardContent>
    </Card>
  );
}
