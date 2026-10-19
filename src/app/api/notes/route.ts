import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

function objectBody(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: { userId: auth.user.id },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({ notes });
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
      { error: "Note data must be a JSON object." },
      { status: 400 },
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const folder =
    typeof body.folder === "string" ? body.folder.trim() : "General";
  const tags = typeof body.tags === "string" ? body.tags.trim() : "";
  const workspaceId =
    body.workspaceId === null ||
    body.workspaceId === undefined ||
    body.workspaceId === ""
      ? null
      : typeof body.workspaceId === "string"
        ? body.workspaceId
        : undefined;

  if (
    !title ||
    title.length > 120 ||
    content.length > 20000 ||
    !folder ||
    folder.length > 80 ||
    tags.length > 500 ||
    workspaceId === undefined ||
    (body.pinned !== undefined && typeof body.pinned !== "boolean") ||
    (body.favorite !== undefined && typeof body.favorite !== "boolean")
  ) {
    return NextResponse.json({ error: "Invalid note data." }, { status: 400 });
  }

  if (workspaceId) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: auth.user.id },
    });
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 },
      );
    }
  }

  const note = await prisma.note.create({
    data: {
      userId: auth.user.id,
      workspaceId,
      title,
      content,
      folder,
      tags,
      pinned: body.pinned === true,
      favorite: body.favorite === true,
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}
