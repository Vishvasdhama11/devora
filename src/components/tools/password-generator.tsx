"use client";

import { useState } from "react";
import { Copy, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePassword, type PasswordOptions } from "@/lib/password-generator";

const initialOptions: PasswordOptions = {
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: false,
};

const optionLabels: { key: keyof PasswordOptions; label: string }[] = [
  { key: "lowercase", label: "Lowercase" },
  { key: "uppercase", label: "Uppercase" },
  { key: "numbers", label: "Numbers" },
  { key: "symbols", label: "Symbols" },
];

export function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [options, setOptions] = useState(initialOptions);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const generate = () => {
    try {
      setPassword(generatePassword(length, options));
      setMessage("");
    } catch (error) {
      setPassword("");
      setMessage(error instanceof Error ? error.message : "Could not generate a password.");
    }
  };

  const copyPassword = async () => {
    if (!password) {
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      setMessage("Password copied.");
    } catch {
      setMessage("Clipboard access was denied. Select and copy the password instead.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="block space-y-2 text-sm text-zinc-300">
          <span>Length: {length}</span>
          <input
            type="range"
            min={8}
            max={128}
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
            className="w-full accent-violet-500"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {optionLabels.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.checked }))}
                className="accent-violet-500"
              />
              {label}
            </label>
          ))}
        </div>
        <div className="min-h-12 break-all rounded-xl border border-white/10 bg-zinc-950 p-3 font-mono text-sm text-violet-100" aria-live="polite">
          {password || "Your password will appear here."}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={generate}><RefreshCcw className="h-4 w-4" /> Generate password</Button>
          <Button variant="secondary" onClick={copyPassword} disabled={!password}><Copy className="h-4 w-4" /> Copy</Button>
        </div>
        {message ? <p role="status" className="text-sm text-zinc-300">{message}</p> : null}
        <p className="text-xs text-zinc-500">Generated in your browser using the Web Crypto API. No password is sent or saved.</p>
      </CardContent>
    </Card>
  );
}
