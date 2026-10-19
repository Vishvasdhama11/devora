import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { NotesManager } from "@/components/notes-manager";
import { prisma } from "@/lib/prisma";

export default async function NotesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;
  const [notes, workspaces] = await Promise.all([
    prisma.note.findMany({
      where: { userId },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      take: 100,
    }),
    prisma.workspace.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
            Personal workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Notes</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Keep markdown notes, organize them into folders, and attach them to
            projects.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-violet-300 hover:text-violet-200"
        >
          Back to dashboard
        </Link>
      </div>
      <NotesManager initialNotes={notes} workspaces={workspaces} />
    </div>
  );
}
