"use client";

import { useMemo, useState } from "react";
import { Pin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Note = {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string;
  pinned: boolean;
  favorite: boolean;
  workspaceId: string | null;
  updatedAt: Date | string;
};

type WorkspaceOption = { id: string; name: string };

export function NotesManager({
  initialNotes,
  workspaces,
}: {
  initialNotes: Note[];
  workspaces: WorkspaceOption[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialNotes[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const selected = notes.find((note) => note.id === selectedId) ?? null;

  const folders = useMemo(
    () =>
      Array.from(new Set(notes.map((note) => note.folder))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [notes],
  );
  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesFolder =
        folderFilter === "all" || note.folder === folderFilter;
      const matchesSearch =
        !normalizedQuery ||
        `${note.title} ${note.content} ${note.tags}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesFolder && matchesSearch;
    });
  }, [folderFilter, notes, query]);

  async function saveNote(
    note: Partial<Note> & Pick<Note, "title" | "content" | "folder" | "tags">,
  ) {
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch(
        note.id ? `/api/notes/${note.id}` : "/api/notes",
        {
          method: note.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(note),
        },
      );
      const payload = (await response.json()) as {
        note?: Note;
        error?: string;
      };
      if (!response.ok || !payload.note) {
        throw new Error(payload.error ?? "Unable to save note.");
      }
      const savedNote = payload.note;
      setNotes((current) =>
        note.id
          ? current.map((item) => (item.id === note.id ? savedNote : item))
          : [savedNote, ...current],
      );
      setSelectedId(savedNote.id);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save note.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateNote(patch: Partial<Note>) {
    if (!selected) return;
    setError("");
    try {
      const response = await fetch(`/api/notes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const payload = (await response.json()) as {
        note?: Note;
        error?: string;
      };
      if (!response.ok || !payload.note)
        throw new Error(payload.error ?? "Unable to update note.");
      const updatedNote = payload.note;
      setNotes((current) =>
        current.map((item) => (item.id === selected.id ? updatedNote : item)),
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update note.",
      );
    }
  }

  async function deleteNote() {
    if (!selected) return;
    setError("");
    try {
      const response = await fetch(`/api/notes/${selected.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as {
        deleted?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.deleted)
        throw new Error(payload.error ?? "Unable to delete note.");
      const next = notes.filter((note) => note.id !== selected.id);
      setNotes(next);
      setSelectedId(next[0]?.id ?? null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete note.",
      );
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.75fr)_minmax(0,1.5fr)]">
      <Card className="p-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes"
            aria-label="Search notes"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
          />
          <select
            value={folderFilter}
            onChange={(event) => setFolderFilter(event.target.value)}
            aria-label="Filter by folder"
            className="max-w-28 rounded-xl border border-white/10 bg-zinc-900 px-2 text-sm text-zinc-200"
          >
            <option value="all">All folders</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 space-y-2">
          {visibleNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setSelectedId(note.id)}
              className={`w-full rounded-xl border p-3 text-left transition ${note.id === selectedId ? "border-violet-500/50 bg-violet-500/10" : "border-white/10 bg-zinc-900/60 hover:border-white/20"}`}
            >
              <span className="flex items-center justify-between gap-2 font-medium text-white">
                <span className="truncate">{note.title}</span>
                {note.pinned ? (
                  <Pin
                    aria-label="Pinned"
                    className="h-3 w-3 shrink-0 text-violet-300"
                  />
                ) : null}
              </span>
              <span className="mt-1 block truncate text-xs text-zinc-400">
                {note.folder} · {note.content || "No content yet"}
              </span>
            </button>
          ))}
          {visibleNotes.length === 0 ? (
            <p className="p-3 text-sm text-zinc-400">
              No notes match. Create a note to get started.
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="p-5">
        <NoteEditor
          key={selected?.id ?? "new"}
          note={selected}
          workspaces={workspaces}
          isSaving={isSaving}
          error={error}
          onSave={saveNote}
          onDelete={selected ? deleteNote : undefined}
          onTogglePinned={() => updateNote({ pinned: !selected?.pinned })}
          onToggleFavorite={() => updateNote({ favorite: !selected?.favorite })}
        />
      </Card>
    </div>
  );
}

function NoteEditor({
  note,
  workspaces,
  isSaving,
  error,
  onSave,
  onDelete,
  onTogglePinned,
  onToggleFavorite,
}: {
  note: Note | null;
  workspaces: WorkspaceOption[];
  isSaving: boolean;
  error: string;
  onSave: (
    note: Partial<Note> & Pick<Note, "title" | "content" | "folder" | "tags">,
  ) => Promise<void>;
  onDelete?: () => Promise<void>;
  onTogglePinned: () => Promise<void>;
  onToggleFavorite: () => Promise<void>;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [folder, setFolder] = useState(note?.folder ?? "General");
  const [tags, setTags] = useState(note?.tags ?? "");
  const [workspaceId, setWorkspaceId] = useState(note?.workspaceId ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave({
          id: note?.id,
          title,
          content,
          folder,
          tags,
          workspaceId: workspaceId || null,
        });
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">
          {note ? "Edit note" : "New note"}
        </h2>
        <div className="flex gap-2">
          {note ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void onTogglePinned()}
            >
              {note.pinned ? "Unpin" : "Pin"}
            </Button>
          ) : null}
          {note ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void onToggleFavorite()}
            >
              {note.favorite ? "Unfavorite" : "Favorite"}
            </Button>
          ) : null}
          {note && onDelete ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void onDelete()}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>
      <label className="block space-y-1 text-sm text-zinc-300">
        <span>Title</span>
        <input
          required
          maxLength={120}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-violet-500"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm text-zinc-300">
          <span>Folder</span>
          <input
            maxLength={80}
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-violet-500"
          />
        </label>
        <label className="block space-y-1 text-sm text-zinc-300">
          <span>Tags (comma separated)</span>
          <input
            maxLength={500}
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-violet-500"
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
          <option value="">Personal note</option>
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 text-sm text-zinc-300">
        <span>Note</span>
        <textarea
          maxLength={20000}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-64 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 font-mono text-sm text-zinc-100 outline-none focus:border-violet-500"
          placeholder="Write a note in Markdown or plain text..."
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : note ? "Save note" : "Create note"}
      </Button>
    </form>
  );
}
