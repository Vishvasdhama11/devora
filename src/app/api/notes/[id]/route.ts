import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

function objectBody(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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
      { error: "Note data must be a JSON object." },
      { status: 400 },
    );
  }

  const data: {
    title?: string;
    content?: string;
    folder?: string;
    tags?: string;
    pinned?: boolean;
    favorite?: boolean;
    workspaceId?: string | null;
  } = {};
  if (body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 120
    ) {
      return NextResponse.json(
        { error: "Note title must be between 1 and 120 characters." },
        { status: 400 },
      );
    }
    data.title = body.title.trim();
  }
  if (body.content !== undefined) {
    if (typeof body.content !== "string" || body.content.length > 20000) {
      return NextResponse.json(
        { error: "Note content must be 20,000 characters or fewer." },
        { status: 400 },
      );
    }
    data.content = body.content;
  }
  if (body.folder !== undefined) {
    if (
      typeof body.folder !== "string" ||
      !body.folder.trim() ||
      body.folder.trim().length > 80
    ) {
      return NextResponse.json(
        { error: "Folder must be between 1 and 80 characters." },
        { status: 400 },
      );
    }
    data.folder = body.folder.trim();
  }
  if (body.tags !== undefined) {
    if (typeof body.tags !== "string" || body.tags.trim().length > 500) {
      return NextResponse.json(
        { error: "Tags must be 500 characters or fewer." },
        { status: 400 },
      );
    }
    data.tags = body.tags.trim();
  }
  for (const field of ["pinned", "favorite"] as const) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "boolean") {
        return NextResponse.json(
          { error: `${field} must be true or false.` },
          { status: 400 },
        );
      }
      data[field] = body[field];
    }
  }
  if (body.workspaceId !== undefined) {
    if (body.workspaceId !== null && typeof body.workspaceId !== "string") {
      return NextResponse.json(
        { error: "Invalid workspace." },
        { status: 400 },
      );
    }
    data.workspaceId =
      typeof body.workspaceId === "string" && body.workspaceId
        ? body.workspaceId
        : null;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Provide at least one note field to update." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const existing = await prisma.note.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  if (data.workspaceId) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: data.workspaceId, userId: auth.user.id },
    });
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 },
      );
    }
  }

  const note = await prisma.note.update({ where: { id: existing.id }, data });
  return NextResponse.json({ note });
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
  const existing = await prisma.note.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!existing) {
    return NextResponse.json({ deleted: false }, { status: 200 });
  }

  await prisma.note.delete({ where: { id: existing.id } });
  return NextResponse.json({ deleted: true }, { status: 200 });
}
