import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { DashboardWorkspaces } from "@/components/dashboard-workspaces";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const [workspaces, favorites, history, settings] = await Promise.all([
    prisma.workspace.findMany({
      where: { userId: session.user.id ?? "" },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.favorite.findMany({
      where: { userId: session.user.id ?? "" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.activityLog.findMany({
      where: { userId: session.user.id ?? "" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.userSettings.findUnique({
      where: { userId: session.user.id ?? "" },
    }),
  ]);

  const userId = session.user.id ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
        </div>
        <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
          Signed in as {session.user.name ?? session.user.email}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-zinc-400">Saved workspaces</div>
          <div className="mt-3 text-3xl font-semibold text-white">{workspaces.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-zinc-400">Favorites</div>
          <div className="mt-3 text-3xl font-semibold text-white">{favorites.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-zinc-400">Recent activity</div>
          <div className="mt-3 text-3xl font-semibold text-white">{history.length}</div>
        </Card>
      </div>

      <DashboardWorkspaces initialWorkspaces={workspaces} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent favorites</h2>
            <Link href="/favorites" className="text-sm text-violet-300 hover:text-violet-200">View all</Link>
          </div>
          <div className="mt-5 space-y-3">
            {favorites.length === 0 ? (
              <p className="text-sm text-zinc-400">No favorites saved yet. Start with your most-used developer tools and pin them here.</p>
            ) : (
              favorites.map((favorite) => (
                <div key={favorite.id} className="rounded-xl border border-white/10 bg-zinc-900/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-violet-300">{favorite.tool}</p>
                      <p className="mt-2 font-medium text-white">{favorite.name}</p>
                    </div>
                    <Link href={favorite.url} className="text-sm text-violet-300 hover:text-violet-200">Open</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Quick actions</h2>
            <Link href="/tools" className="text-sm text-violet-300 hover:text-violet-200">Browse tools</Link>
          </div>
          <div className="mt-5 space-y-3">
            <Link href="/favorites" className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80">Favorites</Link>
            <Link href="/history" className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80">History</Link>
            <Link href="/settings" className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80">Account settings</Link>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold text-white">Profile summary</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Theme</div>
            <div className="mt-2 text-lg font-medium text-white">{settings?.theme ?? "dark"}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Default view</div>
            <div className="mt-2 text-lg font-medium text-white">{settings?.defaultView ?? "dashboard"}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Workspace ID</div>
            <div className="mt-2 text-lg font-medium text-white">{userId.slice(0, 8) || "n/a"}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
