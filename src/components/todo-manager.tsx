"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateOnly } from "@/lib/date-format";

type Todo = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: Date | string | null;
  workspaceId: string | null;
  workspace?: { id: string; name: string } | null;
};
type WorkspaceOption = { id: string; name: string };

export function TodoManager({
  initialTodos,
  workspaces,
}: {
  initialTodos: Todo[];
  workspaces: WorkspaceOption[];
}) {
  const [todos, setTodos] = useState(initialTodos);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [dueAt, setDueAt] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [filter, setFilter] = useState("open");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredTodos = useMemo(() => {
    const now = new Date();
    return todos.filter((todo) => {
      if (filter === "open") return todo.status !== "done";
      if (filter === "done") return todo.status === "done";
      if (filter === "overdue")
        return (
          todo.status !== "done" &&
          todo.dueAt !== null &&
          new Date(todo.dueAt) < now
        );
      return true;
    });
  }, [filter, todos]);

  async function createTodo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          dueAt: dueAt || null,
          workspaceId: workspaceId || null,
        }),
      });
      const payload = (await response.json()) as {
        todo?: Todo;
        error?: string;
      };
      if (!response.ok || !payload.todo)
        throw new Error(payload.error ?? "Unable to create todo.");
      const createdTodo = payload.todo;
      setTodos((current) => [createdTodo, ...current]);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueAt("");
      setWorkspaceId("");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create todo.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateTodo(todo: Todo, patch: Partial<Todo>) {
    setError("");
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const payload = (await response.json()) as {
        todo?: Todo;
        error?: string;
      };
      if (!response.ok || !payload.todo)
        throw new Error(payload.error ?? "Unable to update todo.");
      const updatedTodo = payload.todo;
      setTodos((current) =>
        current.map((item) =>
          item.id === todo.id
            ? { ...updatedTodo, workspace: todo.workspace }
            : item,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update todo.",
      );
    }
  }

  async function deleteTodo(todo: Todo) {
    setError("");
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as {
        deleted?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.deleted)
        throw new Error(payload.error ?? "Unable to delete todo.");
      setTodos((current) => current.filter((item) => item.id !== todo.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete todo.",
      );
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Your tasks</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {todos.filter((todo) => todo.status !== "done").length} open ·{" "}
              {todos.filter((todo) => todo.status === "done").length} done
            </p>
          </div>
          <select
            aria-label="Filter tasks"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="open">Open tasks</option>
            <option value="all">All tasks</option>
            <option value="overdue">Overdue</option>
            <option value="done">Completed</option>
          </select>
        </div>
        {error ? (
          <p role="alert" className="mb-3 text-sm text-rose-300">
            {error}
          </p>
        ) : null}
        <div className="space-y-3">
          {filteredTodos.map((todo) => (
            <article
              key={todo.id}
              className="rounded-xl border border-white/10 bg-zinc-900/60 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <label className="flex min-w-0 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={todo.status === "done"}
                    onChange={(event) =>
                      void updateTodo(todo, {
                        status: event.target.checked ? "done" : "todo",
                      })
                    }
                    aria-label={`Mark ${todo.title} complete`}
                    className="mt-1 accent-violet-500"
                  />
                  <span>
                    <span
                      className={`block font-medium ${todo.status === "done" ? "text-zinc-500 line-through" : "text-white"}`}
                    >
                      {todo.title}
                    </span>
                    {todo.description ? (
                      <span className="mt-1 block text-sm text-zinc-400">
                        {todo.description}
                      </span>
                    ) : null}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => void deleteTodo(todo)}
                  className="text-xs text-rose-300 hover:text-rose-200"
                >
                  Delete
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span
                  className={`rounded-full px-2 py-1 ${todo.priority === "high" ? "bg-rose-500/10 text-rose-200" : todo.priority === "low" ? "bg-zinc-800 text-zinc-300" : "bg-amber-500/10 text-amber-100"}`}
                >
                  {todo.priority} priority
                </span>
                {todo.workspace ? (
                  <span className="rounded-full border border-white/10 px-2 py-1">
                    {todo.workspace.name}
                  </span>
                ) : null}
                {todo.dueAt ? (
                  <time dateTime={new Date(todo.dueAt).toISOString()}>
                    {formatDateOnly(todo.dueAt)}
                  </time>
                ) : null}
              </div>
              {todo.status !== "done" ? (
                <div className="mt-3">
                  <select
                    aria-label={`Status for ${todo.title}`}
                    value={todo.status}
                    onChange={(event) =>
                      void updateTodo(todo, { status: event.target.value })
                    }
                    className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-300"
                  >
                    <option value="todo">To do</option>
                    <option value="in-progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ) : null}
            </article>
          ))}
          {filteredTodos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
              Nothing in this view yet.
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-white">Add a task</h2>
        <form
          onSubmit={(event) => void createTodo(event)}
          className="mt-4 space-y-4"
        >
          <label className="block space-y-1 text-sm text-zinc-300">
            <span>Task</span>
            <input
              required
              maxLength={160}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white"
              placeholder="Ship the first project milestone"
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-300">
            <span>Description</span>
            <textarea
              maxLength={1000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-20 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm text-zinc-300">
              <span>Priority</span>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as Todo["priority"])
                }
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="block space-y-1 text-sm text-zinc-300">
              <span>Due date</span>
              <input
                type="date"
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm text-zinc-300">
            <span>Project</span>
            <select
              value={workspaceId}
              onChange={(event) => setWorkspaceId(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white"
            >
              <option value="">Personal task</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Adding..." : "Add task"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
