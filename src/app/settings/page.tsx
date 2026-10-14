import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { Card } from "@/components/ui/card";
import { UserSettingsForm } from "@/components/user-settings-form";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id ?? "" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Account</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Settings</h1>
        </div>
        <Link href="/dashboard" className="text-sm text-violet-300 hover:text-violet-200">Back to dashboard</Link>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-400">Signed in as</p>
            <p className="mt-1 text-lg font-medium text-white">{session.user.name ?? "Devora user"}</p>
          </div>
          <div className="text-right text-sm text-zinc-400">
            <div>{session.user.email}</div>
            <div className="mt-1 text-violet-300">{settings?.theme ?? "dark"} theme</div>
          </div>
        </div>
      </div>

      <UserSettingsForm initialSettings={settings} />

      <div className="mt-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white">Current preferences</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <div className="flex justify-between border-b border-white/10 pb-2"><span>Theme</span><span>{settings?.theme ?? "dark"}</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span>Default view</span><span>{settings?.defaultView ?? "dashboard"}</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span>Notifications</span><span>{settings?.notifications ? "Enabled" : "Disabled"}</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span>Compact mode</span><span>{settings?.compactMode ? "On" : "Off"}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
