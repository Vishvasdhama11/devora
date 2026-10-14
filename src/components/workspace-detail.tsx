"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  updatedAt: string | Date;
  createdAt: string | Date;
};

export function WorkspaceDetail({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [visibility, setVisibility] = useState(workspace.visibility);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, visibility }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to update workspace.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to save this workspace right now.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDuplicate() {
    setError("");
    setIsDuplicating(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${workspace.name} copy`,
          description: workspace.description ?? "Duplicated workspace",
          visibility: workspace.visibility,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to duplicate workspace.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Unable to duplicate workspace right now.");
    } finally {
      setIsDuplicating(false);
    }
  }

  async function handleDelete() {
    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: workspace.id }),
      });

      const payload = (await response.json()) as { deleted?: boolean; error?: string };

      if (!response.ok || !payload.deleted) {
        setError(payload.error ?? "Unable to delete this workspace.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Unable to delete this workspace right now.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{workspace.name}</h1>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleDuplicate} disabled={isDuplicating || isDeleting || isSaving}>
            {isDuplicating ? "Duplicating..." : "Duplicate"}
          </Button>
          <Button type="button" variant="secondary" className="border border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20" onClick={handleDelete} disabled={isDeleting || isDuplicating || isSaving}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {error ? <p role="alert" className="mb-4 text-sm text-rose-400">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="space-y-2">
              <label htmlFor="workspace-name" className="text-sm text-zinc-300">Name</label>
              <input id="workspace-name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none" />
            </div>

            <div className="space-y-2">
              <label htmlFor="workspace-description" className="text-sm text-zinc-300">Description</label>
              <textarea id="workspace-description" value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-[110px] w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none" />
            </div>

            <div className="space-y-2">
              <label htmlFor="workspace-visibility" className="text-sm text-zinc-300">Visibility</label>
              <select id="workspace-visibility" value={visibility} onChange={(event) => setVisibility(event.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none">
                <option value="private">Private</option>
                <option value="team">Team</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
              <Link href="/dashboard" className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:border-violet-500/40 hover:text-violet-200">Back to dashboard</Link>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white">Workspace metadata</h2>
          <div className="mt-5 space-y-4 text-sm text-zinc-300">
            <div className="flex justify-between border-b border-white/10 pb-2"><span>Visibility</span><span>{workspace.visibility}</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span>Created</span><span>{new Date(workspace.createdAt).toLocaleString()}</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span>Updated</span><span>{new Date(workspace.updatedAt).toLocaleString()}</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span>ID</span><span className="font-mono text-xs text-violet-200">{workspace.id.slice(0, 8)}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
