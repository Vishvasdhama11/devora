import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { BookmarkManager } from "@/components/bookmark-manager";
import { prisma } from "@/lib/prisma";

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
            Personal workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Bookmarks</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Save useful documentation, references, and project links.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-violet-300 hover:text-violet-200"
        >
          Back to dashboard
        </Link>
      </div>
      <BookmarkManager initialBookmarks={bookmarks} />
    </div>
  );
}
