import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

function objectBody(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeUrl(value: string): string | null {
  if (value.length > 2048) {
    return null;
  }
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: auth.user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ bookmarks });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> | null;
  try {
    body = objectBody(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }
  if (!body) {
    return NextResponse.json(
      { error: "Bookmark data must be a JSON object." },
      { status: 400 },
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  const url = normalizeUrl(rawUrl);
  const description =
    body.description === undefined
      ? ""
      : typeof body.description === "string"
        ? body.description.trim()
        : null;
  const tags = typeof body.tags === "string" ? body.tags.trim() : "";

  if (
    !title ||
    title.length > 120 ||
    !url ||
    description === null ||
    description.length > 500 ||
    tags.length > 500
  ) {
    return NextResponse.json(
      {
        error:
          "Enter a title, a valid HTTP(S) URL, and optional description/tags.",
      },
      { status: 400 },
    );
  }

  const bookmark = await prisma.bookmark.create({
    data: { userId: auth.user.id, title, url, description, tags },
  });
  return NextResponse.json({ bookmark }, { status: 201 });
}
