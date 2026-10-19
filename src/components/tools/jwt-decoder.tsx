"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decodeJwt } from "@/lib/jwt-decoder";

export function JwtDecoder() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<{ header: unknown; payload: unknown } | null>(null);
  const [error, setError] = useState("");

  const decode = () => {
    try {
      setDecoded(decodeJwt(token));
      setError("");
    } catch (decodeError) {
      setDecoded(null);
      setError(decodeError instanceof Error ? decodeError.message : "Could not decode this token.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>JWT Decoder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block space-y-2 text-sm text-zinc-300">
          <span>Paste a JSON Web Token</span>
          <textarea
            value={token}
            onChange={(event) => setToken(event.target.value)}
            spellCheck={false}
            className="min-h-32 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 font-mono text-sm text-zinc-100 outline-none focus:border-violet-500/60"
            placeholder="header.payload.signature"
          />
        </label>
        <button type="button" onClick={decode} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500">
          Decode token
        </button>
        {error ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-200">{error}</p> : null}
        {decoded ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {(["header", "payload"] as const).map((part) => (
              <section key={part} className="space-y-2">
                <h3 className="text-sm font-medium capitalize text-zinc-300">{part}</h3>
                <pre className="min-h-32 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-white/10 bg-zinc-950 p-3 text-sm text-violet-100">
                  {JSON.stringify(decoded[part], null, 2)}
                </pre>
              </section>
            ))}
          </div>
        ) : null}
        <p role="note" className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-100">
          This only decodes the token; it does not verify its signature. Treat all displayed claims as untrusted. Processing stays in your browser.
        </p>
      </CardContent>
    </Card>
  );
}
