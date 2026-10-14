"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Favorite = {
  id: string;
  name: string;
  tool: string;
  url: string;
};

export function FavoritesList({ initialFavorites }: { initialFavorites: Favorite[] }) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function removeFavorite(url: string) {
    setError("");
    setRemovingUrl(url);

    try {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = (await response.json()) as { deleted?: boolean; error?: string };

      if (!response.ok || !payload.deleted) {
        setError(payload.error ?? "Unable to remove this favorite.");
        return;
      }

      setFavorites((current) => current.filter((favorite) => favorite.url !== url));
    } catch {
      setError("Unable to remove this favorite right now.");
    } finally {
      setRemovingUrl(null);
    }
  }

  return (
    <>
      {error ? <p role="alert" className="mb-4 text-sm text-rose-400">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {favorites.length === 0 ? (
          <Card className="p-8 md:col-span-2">
            <p className="text-zinc-400">
              No favorites saved yet. Start with your most-used developer tools and pin them here.
            </p>
          </Card>
        ) : (
          favorites.map((favorite) => (
            <Card key={favorite.id} className="p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-violet-300">
                {favorite.tool}
              </div>
              <div className="mt-3 text-xl font-semibold text-white">{favorite.name}</div>
              <p className="mt-2 text-sm text-zinc-400">Saved to your workspace for faster navigation.</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Link href={favorite.url} className="text-sm text-violet-300 hover:text-violet-200">
                  Open item →
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFavorite(favorite.url)}
                  disabled={removingUrl !== null}
                  aria-label={`Remove ${favorite.name} from favorites`}
                >
                  {removingUrl === favorite.url ? "Removing..." : "Remove"}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
