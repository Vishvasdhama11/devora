import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { FavoritesList } from "@/components/favorites-list";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id ?? "" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Saved</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Favorites</h1>
        </div>
        <Link href="/dashboard" className="text-sm text-violet-300 hover:text-violet-200">Back to dashboard</Link>
      </div>

      <FavoritesList initialFavorites={favorites} />
    </div>
  );
}
