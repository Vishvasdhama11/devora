"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const controller = new AbortController();

    async function loadSavedTheme() {
      try {
        const response = await fetch("/api/settings", { signal: controller.signal });
        const payload = (await response.json()) as { settings?: { theme?: unknown }; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load your saved theme.");
        }

        if (payload.settings?.theme === "dark" || payload.settings?.theme === "light" || payload.settings?.theme === "system") {
          setTheme(payload.settings.theme);
        }
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") {
          return;
        }
        setError(cause instanceof Error ? cause.message : "Unable to load your saved theme.");
      }
    }

    void loadSavedTheme();
    return () => controller.abort();
  }, [session?.user?.id, setTheme, status]);

  async function toggleTheme() {
    const previousTheme = resolvedTheme ?? "dark";
    const theme = previousTheme === "dark" ? "light" : "dark";
    setError("");
    setTheme(theme);

    if (status !== "authenticated") {
      return;
    }

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save your theme.");
      }

      router.refresh();
    } catch (cause) {
      setTheme(previousTheme);
      setError(cause instanceof Error ? cause.message : "Unable to save your theme.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      {error ? <span className="text-xs text-rose-400" role="alert">{error}</span> : null}
    </div>
  );
}
