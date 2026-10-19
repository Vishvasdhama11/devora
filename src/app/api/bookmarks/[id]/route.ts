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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const data: {
    title?: string;
    url?: string;
    description?: string | null;
    tags?: string;
  } = {};
  if (body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 120
    ) {
      return NextResponse.json(
        { error: "Bookmark title must be between 1 and 120 characters." },
        { status: 400 },
      );
    }
    data.title = body.title.trim();
  }
  if (body.url !== undefined) {
    const normalizedUrl =
      typeof body.url === "string" ? normalizeUrl(body.url.trim()) : null;
    if (!normalizedUrl) {
      return NextResponse.json(
        { error: "Bookmark URL must use HTTP or HTTPS." },
        { status: 400 },
      );
    }
    data.url = normalizedUrl;
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      return NextResponse.json(
        { error: "Bookmark description must be text." },
        { status: 400 },
      );
    }
    if (
      typeof body.description === "string" &&
      body.description.trim().length > 500
    ) {
      return NextResponse.json(
        { error: "Bookmark description must be 500 characters or fewer." },
        { status: 400 },
      );
    }
    data.description =
      typeof body.description === "string" ? body.description.trim() : null;
  }
  if (body.tags !== undefined) {
    if (typeof body.tags !== "string" || body.tags.trim().length > 500) {
      return NextResponse.json(
        { error: "Bookmark tags must be 500 characters or fewer." },
        { status: 400 },
      );
    }
    data.tags = body.tags.trim();
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Provide at least one bookmark field to update." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const existing = await prisma.bookmark.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Bookmark not found." }, { status: 404 });
  }

  const bookmark = await prisma.bookmark.update({
    where: { id: existing.id },
    data,
  });
  return NextResponse.json({ bookmark });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.bookmark.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!existing) {
    return NextResponse.json({ deleted: false }, { status: 200 });
  }

  await prisma.bookmark.delete({ where: { id: existing.id } });
  return NextResponse.json({ deleted: true }, { status: 200 });
}
