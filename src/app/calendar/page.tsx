import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;
  const [todos, projects] = await Promise.all([
    prisma.todo.findMany({
      where: { userId, status: { not: "done" }, dueAt: { not: null } },
      include: { workspace: { select: { id: true, name: true } } },
      orderBy: { dueAt: "asc" },
      take: 100,
    }),
    prisma.workspace.findMany({
      where: { userId, deadline: { not: null }, status: { not: "completed" } },
      orderBy: { deadline: "asc" },
      take: 100,
    }),
  ]);

  const events = [
    ...todos.flatMap((todo) =>
      todo.dueAt
        ? [
            {
              id: `todo-${todo.id}`,
              title: todo.title,
              type: "Task",
              date: todo.dueAt,
              href: "/todos",
              detail: todo.workspace?.name ?? `${todo.priority} priority`,
            },
          ]
        : [],
    ),
    ...projects.flatMap((project) =>
      project.deadline
        ? [
            {
              id: `project-${project.id}`,
              title: project.name,
              type: "Project deadline",
              date: project.deadline,
              href: `/dashboard/workspaces/${project.id}`,
              detail: `${project.progress}% complete`,
            },
          ]
        : [],
    ),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const dateGroups = new Map<string, typeof events>();
  for (const event of events) {
    const date = event.date.toISOString().slice(0, 10);
    const group = dateGroups.get(date) ?? [];
    group.push(event);
    dateGroups.set(date, group);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
            Planning
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Calendar agenda
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Project deadlines and open task due dates, ordered by day.
          </p>
        </div>
        <Link
          href="/todos"
          className="text-sm text-violet-300 hover:text-violet-200"
        >
          Manage tasks
        </Link>
      </div>
      {events.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-zinc-300">No scheduled items yet.</p>
          <p className="mt-2 text-sm text-zinc-500">
            Add due dates to tasks or deadlines to projects to see them here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(dateGroups.entries()).map(([date, dateEvents]) => (
            <section key={date}>
              <h2 className="mb-3 text-sm font-medium text-zinc-300">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "full",
                  timeZone: "UTC",
                }).format(new Date(`${date}T00:00:00.000Z`))}
              </h2>
              <div className="space-y-2">
                {dateEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={event.href}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4 transition hover:border-violet-500/40"
                  >
                    <div>
                      <span className="text-xs uppercase tracking-[0.16em] text-violet-300">
                        {event.type}
                      </span>
                      <p className="mt-1 font-medium text-white">
                        {event.title}
                      </p>
                    </div>
                    <span className="text-sm text-zinc-400">
                      {event.detail}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
