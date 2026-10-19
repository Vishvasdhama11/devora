"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateOnly } from "@/lib/date-format";

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  status: string;
  techStack: string;
  progress: number;
  deadline: Date | string | null;
  repositoryUrl: string | null;
  demoUrl: string | null;
  updatedAt: string | Date;
  createdAt: string | Date;
};

export function WorkspaceDetail({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [visibility, setVisibility] = useState(workspace.visibility);
  const [status, setStatus] = useState(workspace.status);
  const [techStack, setTechStack] = useState(workspace.techStack);
  const [progress, setProgress] = useState(workspace.progress);
  const [deadline, setDeadline] = useState(
    workspace.deadline
      ? new Date(workspace.deadline).toISOString().slice(0, 10)
      : "",
  );
  const [repositoryUrl, setRepositoryUrl] = useState(
    workspace.repositoryUrl ?? "",
  );
  const [demoUrl, setDemoUrl] = useState(workspace.demoUrl ?? "");
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
        body: JSON.stringify({
          name,
          description,
          visibility,
          status,
          techStack,
          progress,
          deadline: deadline || null,
          repositoryUrl: repositoryUrl || null,
          demoUrl: demoUrl || null,
        }),
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
          status: workspace.status,
          techStack: workspace.techStack,
          progress: workspace.progress,
          deadline: workspace.deadline,
          repositoryUrl: workspace.repositoryUrl,
          demoUrl: workspace.demoUrl,
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

      const payload = (await response.json()) as {
        deleted?: boolean;
        error?: string;
      };

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
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
            Workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {workspace.name}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDuplicate}
            disabled={isDuplicating || isDeleting || isSaving}
          >
            {isDuplicating ? "Duplicating..." : "Duplicate"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="border border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
            onClick={handleDelete}
            disabled={isDeleting || isDuplicating || isSaving}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mb-4 text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="space-y-2">
              <label htmlFor="workspace-name" className="text-sm text-zinc-300">
                Name
              </label>
              <input
                id="workspace-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="workspace-description"
                className="text-sm text-zinc-300"
              >
                Description
              </label>
              <textarea
                id="workspace-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-[110px] w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="workspace-visibility"
                className="text-sm text-zinc-300"
              >
                Visibility
              </label>
              <select
                id="workspace-visibility"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none"
              >
                <option value="private">Private</option>
                <option value="team">Team</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="workspace-status"
                  className="text-sm text-zinc-300"
                >
                  Project status
                </label>
                <select
                  id="workspace-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <label className="space-y-2 text-sm text-zinc-300">
                <span>Progress: {progress}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(event) => setProgress(Number(event.target.value))}
                  className="block w-full accent-violet-500"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="workspace-tech-stack"
                className="text-sm text-zinc-300"
              >
                Tech stack
              </label>
              <input
                id="workspace-tech-stack"
                maxLength={200}
                value={techStack}
                onChange={(event) => setTechStack(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
                placeholder="React, TypeScript, PostgreSQL"
              />
            </div>

            <label className="block space-y-2 text-sm text-zinc-300">
              <span>Deadline</span>
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2 text-sm text-zinc-300">
                <span>Repository URL</span>
                <input
                  type="url"
                  value={repositoryUrl}
                  onChange={(event) => setRepositoryUrl(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
                  placeholder="https://github.com/..."
                />
              </label>
              <label className="block space-y-2 text-sm text-zinc-300">
                <span>Live demo URL</span>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(event) => setDemoUrl(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
                  placeholder="https://..."
                />
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:border-violet-500/40 hover:text-violet-200"
              >
                Back to dashboard
              </Link>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white">
            Workspace metadata
          </h2>
          <div className="mt-5 space-y-4 text-sm text-zinc-300">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>Visibility</span>
              <span>{workspace.visibility}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>Status</span>
              <span className="capitalize">{workspace.status}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>Progress</span>
              <span>{workspace.progress}%</span>
            </div>
            {workspace.deadline ? (
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Deadline</span>
                <span>{formatDateOnly(workspace.deadline)}</span>
              </div>
            ) : null}
            {workspace.techStack ? (
              <div className="border-b border-white/10 pb-2">
                <span className="block">Tech stack</span>
                <span className="mt-1 block text-zinc-400">{workspace.techStack}</span>
              </div>
            ) : null}
            {workspace.repositoryUrl ? (
              <a href={workspace.repositoryUrl} target="_blank" rel="noopener noreferrer" className="block border-b border-white/10 pb-2 text-violet-200 hover:text-violet-100">
                Repository
              </a>
            ) : null}
            {workspace.demoUrl ? (
              <a href={workspace.demoUrl} target="_blank" rel="noopener noreferrer" className="block border-b border-white/10 pb-2 text-violet-200 hover:text-violet-100">
                Live demo
              </a>
            ) : null}
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>Created</span>
              <span>{new Date(workspace.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>Updated</span>
              <span>{new Date(workspace.updatedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span>ID</span>
              <span className="font-mono text-xs text-violet-200">
                {workspace.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
