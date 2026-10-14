import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.user.id;
  const body = (await request.json()) as { tool?: unknown; name?: unknown; url?: unknown };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const tool = typeof body.tool === "string" ? body.tool.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!name || !tool || !url.startsWith("/tools/") || url.startsWith("//")) {
    return NextResponse.json({ error: "Missing favorite metadata." }, { status: 400 });
  }

  const existing = await prisma.favorite.findFirst({
    where: { userId: auth.user.id, url },
  });

  if (existing) {
    return NextResponse.json({ favorite: existing, created: false }, { status: 200 });
  }

  const favorite = await prisma.$transaction(async (transaction) => {
    const createdFavorite = await transaction.favorite.create({
      data: {
        userId,
        name,
        tool,
        url,
      },
    });

    await transaction.activityLog.create({
      data: {
        userId,
        action: "favorite-added",
        title: `Saved ${createdFavorite.name}`,
        description: `Added ${createdFavorite.name} to favorites.`,
      },
    });

    return createdFavorite;
  });

  return NextResponse.json({ favorite, created: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { url?: unknown };
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!url) {
    return NextResponse.json({ error: "Favorite URL is required." }, { status: 400 });
  }

  const favorite = await prisma.favorite.findFirst({
    where: { userId: auth.user.id, url },
  });

  if (!favorite) {
    return NextResponse.json({ deleted: false }, { status: 200 });
  }

  await prisma.$transaction([
    prisma.favorite.delete({ where: { id: favorite.id } }),
    prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "favorite-removed",
        title: `Removed ${favorite.name} from favorites`,
        description: `Removed ${favorite.name} from favorites.`,
      },
    }),
  ]);

  return NextResponse.json({ deleted: true }, { status: 200 });
}
