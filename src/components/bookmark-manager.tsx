"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  tags: string;
};

export function BookmarkManager({
  initialBookmarks,
}: {
  initialBookmarks: Bookmark[];
}) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function addBookmark(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, description, tags }),
      });
      const payload = (await response.json()) as {
        bookmark?: Bookmark;
        error?: string;
      };
      if (!response.ok || !payload.bookmark)
        throw new Error(payload.error ?? "Unable to save bookmark.");
      const createdBookmark = payload.bookmark;
      setBookmarks((current) => [createdBookmark, ...current]);
      setTitle("");
      setUrl("");
      setDescription("");
      setTags("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save bookmark.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteBookmark(bookmark: Bookmark) {
    setError("");
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as {
        deleted?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.deleted)
        throw new Error(payload.error ?? "Unable to delete bookmark.");
      setBookmarks((current) =>
        current.filter((item) => item.id !== bookmark.id),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete bookmark.",
      );
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-white">Saved links</h2>
        <div className="mt-4 space-y-3">
          {bookmarks.map((bookmark) => (
            <article
              key={bookmark.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900/60 p-4"
            >
              <div className="min-w-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-violet-200 hover:text-violet-100"
                >
                  {bookmark.title}
                </a>
                <p className="mt-1 break-all text-xs text-zinc-500">
                  {bookmark.url}
                </p>
                {bookmark.description ? (
                  <p className="mt-2 text-sm text-zinc-300">
                    {bookmark.description}
                  </p>
                ) : null}
                {bookmark.tags ? (
                  <p className="mt-2 text-xs text-zinc-500">{bookmark.tags}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void deleteBookmark(bookmark)}
                className="text-xs text-rose-300 hover:text-rose-200"
              >
                Remove
              </button>
            </article>
          ))}
          {bookmarks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
              Save useful docs, references, and project links here.
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-white">Save a link</h2>
        <form
          onSubmit={(event) => void addBookmark(event)}
          className="mt-4 space-y-4"
        >
          <label className="block space-y-1 text-sm text-zinc-300">
            <span>Title</span>
            <input
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-300">
            <span>URL</span>
            <input
              required
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-300">
            <span>Description</span>
            <textarea
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-20 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-300">
            <span>Tags</span>
            <input
              maxLength={500}
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="docs, reference"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save bookmark"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
