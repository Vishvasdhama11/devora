"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Settings = {
  theme: string;
  defaultView: string;
  notifications: boolean;
  compactMode: boolean;
};

export function UserSettingsForm({ initialSettings }: { initialSettings?: Settings | null }) {
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    theme: initialSettings?.theme ?? "dark",
    defaultView: initialSettings?.defaultView ?? "dashboard",
    notifications: initialSettings?.notifications ?? true,
    compactMode: initialSettings?.compactMode ?? false,
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialSettings?.theme) {
      setTheme(initialSettings.theme);
    }
  }, [initialSettings?.theme, setTheme]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to save settings.");
        return;
      }

      setTheme(settings.theme);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setError("Something went wrong while saving your settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white">Profile</h2>
        <div className="mt-5 space-y-4 text-sm text-zinc-300">
          <div className="space-y-2">
            <label htmlFor="theme" className="text-sm text-zinc-300">Theme</label>
            <select id="theme" value={settings.theme} onChange={(event) => {
              const theme = event.target.value;
              setSettings((current) => ({ ...current, theme }));
              setTheme(theme);
            }} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="default-view" className="text-sm text-zinc-300">Default view</label>
            <select id="default-view" value={settings.defaultView} onChange={(event) => setSettings((current) => ({ ...current, defaultView: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none">
              <option value="dashboard">Dashboard</option>
              <option value="tools">Tools</option>
              <option value="favorites">Favorites</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white">Preferences</h2>
        <div className="mt-5 space-y-4 text-sm text-zinc-300">
          <label className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-3">
            <span>Notifications</span>
            <input type="checkbox" checked={settings.notifications} onChange={(event) => setSettings((current) => ({ ...current, notifications: event.target.checked }))} className="h-4 w-4 accent-violet-500" />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-3">
            <span>Compact mode</span>
            <input type="checkbox" checked={settings.compactMode} onChange={(event) => setSettings((current) => ({ ...current, compactMode: event.target.checked }))} className="h-4 w-4 accent-violet-500" />
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          {saved ? <p className="text-sm text-emerald-400">Settings saved.</p> : null}

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save preferences"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
