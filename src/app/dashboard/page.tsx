import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { DashboardWorkspaces } from "@/components/dashboard-workspaces";
import { ToolSearch } from "@/components/tool-search";
import { Card } from "@/components/ui/card";
import { formatDateOnly } from "@/lib/date-format";
import { prisma } from "@/lib/prisma";
import { TOOL_REGISTRY } from "@/tools/registry";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = session.user.id ?? "";
  const [
    workspaces,
    favorites,
    history,
    settings,
    workspaceCount,
    notesCount,
    bookmarksCount,
    openTodoCount,
    upcomingTodos,
  ] = await Promise.all([
    prisma.workspace.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.userSettings.findUnique({
      where: { userId },
    }),
    prisma.workspace.count({ where: { userId } }),
    prisma.note.count({ where: { userId } }),
    prisma.bookmark.count({ where: { userId } }),
    prisma.todo.count({ where: { userId, status: { not: "done" } } }),
    prisma.todo.findMany({
      where: { userId, status: { not: "done" }, dueAt: { not: null } },
      include: { workspace: { select: { id: true, name: true } } },
      orderBy: { dueAt: "asc" },
      take: 4,
    }),
  ]);

  const quickToolIds = [
    "json-formatter",
    "api-tester",
    "regex-tester",
    "json-to-csv",
    "jwt-decoder",
    "password-generator",
  ];
  const quickTools = quickToolIds
    .map((id) => TOOL_REGISTRY.find((tool) => tool.id === id))
    .filter((tool) => tool !== undefined);
  const displayName =
    session.user.name?.trim().split(/\s+/)[0] || session.user.email || "there";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
            Workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your workspaces, saved tools, and recent activity in one place.
          </p>
        </div>
        <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
          {session.user.email}
        </div>
      </div>

      <Card className="mb-6 p-5">
        <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
          Find a developer tool
        </div>
        <ToolSearch inline placeholder="Search JSON, CSV, JWT, API, regex..." />
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-zinc-400">Projects</div>
          <div className="mt-3 text-3xl font-semibold text-white">
            {workspaceCount}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-zinc-400">Open tasks</div>
          <div className="mt-3 text-3xl font-semibold text-white">
            {openTodoCount}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-zinc-400">Notes & bookmarks</div>
          <div className="mt-3 text-3xl font-semibold text-white">
            {notesCount + bookmarksCount}
          </div>
        </Card>
      </div>

      <DashboardWorkspaces initialWorkspaces={workspaces} />

      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
              Quick access
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Pick up a task
            </h2>
          </div>
          <Link
            href="/tools"
            className="text-sm text-violet-300 hover:text-violet-200"
          >
            All tools
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 transition hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              <div className="text-xs uppercase tracking-[0.16em] text-violet-300">
                {tool.category}
              </div>
              <div className="mt-2 font-medium text-white">{tool.name}</div>
              <p className="mt-1 text-sm text-zinc-400">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Upcoming tasks
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {openTodoCount} open task{openTodoCount === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              href="/todos"
              className="text-sm text-violet-300 hover:text-violet-200"
            >
              View planner
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {upcomingTodos.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Tasks with due dates will appear here.
              </p>
            ) : (
              upcomingTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="rounded-xl border border-white/10 bg-zinc-900/70 p-3"
                >
                  <p className="font-medium text-white">{todo.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {todo.workspace?.name ? `${todo.workspace.name} · ` : ""}
                    {todo.dueAt ? `Due ${formatDateOnly(todo.dueAt)}` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Recent favorites
            </h2>
            <Link
              href="/favorites"
              className="text-sm text-violet-300 hover:text-violet-200"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {favorites.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No favorites saved yet. Start with your most-used developer
                tools and pin them here.
              </p>
            ) : (
              favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="rounded-xl border border-white/10 bg-zinc-900/70 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
                        {favorite.tool}
                      </p>
                      <p className="mt-2 font-medium text-white">
                        {favorite.name}
                      </p>
                    </div>
                    <Link
                      href={favorite.url}
                      className="text-sm text-violet-300 hover:text-violet-200"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Recent activity
            </h2>
            <Link
              href="/history"
              className="text-sm text-violet-300 hover:text-violet-200"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Your workspace activity will show up here as you create
                workspaces and update your settings.
              </p>
            ) : (
              history.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-xl border border-white/10 bg-zinc-900/70 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{activity.title}</p>
                      {activity.description ? (
                        <p className="mt-1 text-sm text-zinc-400">
                          {activity.description}
                        </p>
                      ) : null}
                    </div>
                    <time
                      dateTime={activity.createdAt.toISOString()}
                      className="shrink-0 text-xs text-zinc-500"
                    >
                      {activity.createdAt.toLocaleDateString()}
                    </time>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Quick actions</h2>
            <Link
              href="/tools"
              className="text-sm text-violet-300 hover:text-violet-200"
            >
              Browse tools
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            <Link
              href="/dashboard#new-workspace"
              className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              + New project
            </Link>
            <Link
              href="/todos"
              className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              + New task
            </Link>
            <Link
              href="/calendar"
              className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              Calendar agenda
            </Link>
            <Link
              href="/notes"
              className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              + New note
            </Link>
            <Link
              href="/bookmarks"
              className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              Saved bookmarks
            </Link>
            <Link
              href="/favorites"
              className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              Favorites
            </Link>
            <Link
              href="/history"
              className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              History
            </Link>
            <Link
              href="/settings"
              className="block rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-sm text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900/80"
            >
              Account settings
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/notes"
          className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 transition hover:border-violet-500/40"
        >
          <span className="text-xs uppercase tracking-[0.16em] text-violet-300">
            Notes
          </span>
          <span className="mt-2 block text-2xl font-semibold text-white">
            {notesCount}
          </span>
          <span className="mt-1 block text-sm text-zinc-400">
            Markdown notes and project documentation
          </span>
        </Link>
        <Link
          href="/bookmarks"
          className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 transition hover:border-violet-500/40"
        >
          <span className="text-xs uppercase tracking-[0.16em] text-violet-300">
            Bookmarks
          </span>
          <span className="mt-2 block text-2xl font-semibold text-white">
            {bookmarksCount}
          </span>
          <span className="mt-1 block text-sm text-zinc-400">
            Useful documentation and reference links
          </span>
        </Link>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold text-white">Profile summary</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Theme
            </div>
            <div className="mt-2 text-lg font-medium text-white">
              {settings?.theme ?? "dark"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Default view
            </div>
            <div className="mt-2 text-lg font-medium text-white">
              {settings?.defaultView ?? "dashboard"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Workspace ID
            </div>
            <div className="mt-2 text-lg font-medium text-white">
              {userId.slice(0, 8) || "n/a"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
