"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  updatedAt: Date | string;
};

const workspaceTemplates = [
  {
    name: "Frontend Sprint",
    description: "UI polish, design QA, and release checklists.",
  },
  {
    name: "API Expedition",
    description: "Contract cleanup, request testing, and endpoint validation.",
  },
  {
    name: "CLI Toolkit",
    description: "Command workflows, tooling scripts, and output experiments.",
  },
  {
    name: "Debug Session",
    description: "Bugs, logs, and validation loops for one problem at a time.",
  },
];

export function DashboardWorkspaces({
  initialWorkspaces,
}: {
  initialWorkspaces: Workspace[];
}) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [deadline, setDeadline] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(
    null,
  );

  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((workspace) => {
      const matchesSearch =
        workspace.name.toLowerCase().includes(search.toLowerCase()) ||
        (workspace.description ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesVisibility =
        visibilityFilter === "all" || workspace.visibility === visibilityFilter;
      return matchesSearch && matchesVisibility;
    });
  }, [search, visibilityFilter, workspaces]);

  async function createWorkspace(
    nextName: string,
    nextDescription: string,
    nextVisibility: string,
  ) {
    const response = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nextName,
        description: nextDescription,
        visibility: nextVisibility,
        techStack,
        deadline: deadline || null,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      workspace?: Workspace;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to create workspace.");
    }

    if (payload.workspace) {
      setWorkspaces((current) => [payload.workspace!, ...current]);
    }
  }

  async function handleCreateWorkspace(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    setIsSaving(true);

    try {
      await createWorkspace(name, description, visibility);
      setName("");
      setDescription("");
      setTechStack("");
      setDeadline("");
      setVisibility("private");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Something went wrong while creating the workspace.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTemplateCreate(template: {
    name: string;
    description: string;
  }) {
    setError("");
    setIsSaving(true);

    try {
      await createWorkspace(
        `${template.name} workspace`,
        template.description,
        visibility,
      );
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create this template workspace.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteWorkspace(id: string) {
    setError("");
    setDeletingWorkspaceId(id);

    try {
      const response = await fetch("/api/workspaces", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const payload = (await response.json()) as {
        deleted?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.deleted) {
        setError(payload.error ?? "Unable to remove this workspace.");
        return;
      }

      setWorkspaces((current) =>
        current.filter((workspace) => workspace.id !== id),
      );
    } catch {
      setError("Unable to remove this workspace right now.");
    } finally {
      setDeletingWorkspaceId(null);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-200">
            {workspaces.length} shown
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
          />
          <select
            value={visibilityFilter}
            onChange={(event) => setVisibilityFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="private">Private</option>
            <option value="team">Team</option>
          </select>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-rose-400">
            {error}
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
          {filteredWorkspaces.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No projects match your filters yet. Create a new project or try a
              different search.
            </p>
          ) : (
            filteredWorkspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="rounded-xl border border-white/10 bg-zinc-900/70 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/dashboard/workspaces/${workspace.id}`}
                      className="font-medium text-white hover:text-violet-200"
                    >
                      {workspace.name}
                    </Link>
                    <p className="mt-1 text-xs capitalize text-zinc-400">
                      {workspace.status} · {workspace.visibility}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/workspaces/${workspace.id}`}
                      className="text-xs text-violet-300 hover:text-violet-200"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteWorkspace(workspace.id)}
                      disabled={deletingWorkspaceId !== null || isSaving}
                      className="text-xs text-rose-300 hover:text-rose-200 disabled:opacity-50"
                    >
                      {deletingWorkspaceId === workspace.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
                {workspace.description ? (
                  <p className="mt-2 text-sm text-zinc-400">
                    {workspace.description}
                  </p>
                ) : null}
                {workspace.techStack ? (
                  <p className="mt-2 text-xs text-violet-200">
                    {workspace.techStack}
                  </p>
                ) : null}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${workspace.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400">
                    {workspace.progress}%
                  </span>
                  {workspace.deadline ? (
                    <time
                      dateTime={new Date(workspace.deadline).toISOString()}
                      className="text-xs text-zinc-500"
                    >
                      Due {formatDateOnly(workspace.deadline)}
                    </time>
                  ) : null}
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">
                  Updated {new Date(workspace.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card id="new-workspace" className="p-6">
        <h2 className="text-xl font-semibold text-white">New project</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {workspaceTemplates.map((template) => (
            <button
              key={template.name}
              type="button"
              onClick={() => handleTemplateCreate(template)}
              disabled={isSaving || deletingWorkspaceId !== null}
              className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200 transition hover:border-violet-400 hover:bg-violet-500/20"
            >
              {template.name}
            </button>
          ))}
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleCreateWorkspace}>
          <div className="space-y-2">
            <label htmlFor="workspace-name" className="text-sm text-zinc-300">
              Name
            </label>
            <input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              placeholder="AI tooling sprint"
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
              className="min-h-[96px] w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              placeholder="Project goals, notes, tools, and links"
            />
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
              value={techStack}
              onChange={(event) => setTechStack(event.target.value)}
              maxLength={200}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              placeholder="Next.js, TypeScript, PostgreSQL"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="workspace-deadline"
              className="text-sm text-zinc-300"
            >
              Deadline
            </label>
            <input
              id="workspace-deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none"
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

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create project"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
