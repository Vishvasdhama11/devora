"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type ToolActionsProps = {
  tool: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
};

export function ToolActions({ tool }: ToolActionsProps) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const url = `/tools/${tool.slug}`;

  async function saveFavorite() {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tool.name,
          tool: tool.category,
          url,
        }),
      });

      const payload = (await response.json()) as { error?: string; created?: boolean };

      if (!response.ok) {
        setError(payload.error ?? "Unable to save favorite.");
        return;
      }

      setSaved(Boolean(payload.created ?? true));
    } catch {
      setError("Unable to save this item right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" className="w-full" onClick={saveFavorite} disabled={isSaving}>
        {isSaving ? "Saving..." : saved ? "Saved to favorites" : "Save to favorites"}
      </Button>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
