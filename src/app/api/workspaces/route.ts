import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    where: { userId: auth.user.id },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  return NextResponse.json({ workspaces });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.user.id;
  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof parsedBody !== "object" || parsedBody === null || Array.isArray(parsedBody)) {
    return NextResponse.json({ error: "Workspace data must be a JSON object." }, { status: 400 });
  }

  const body = parsedBody as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "Untitled workspace";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const visibility = body.visibility ?? "private";

  if (
    (body.name !== undefined && typeof body.name !== "string") ||
    !name ||
    name.length > 100 ||
    (body.description !== undefined && typeof body.description !== "string") ||
    description.length > 1000 ||
    (visibility !== "private" && visibility !== "team")
  ) {
    return NextResponse.json({ error: "Invalid workspace data." }, { status: 400 });
  }

  const workspace = await prisma.$transaction(async (transaction) => {
    const createdWorkspace = await transaction.workspace.create({
      data: {
        userId,
        name,
        description,
        visibility,
      },
    });

    await transaction.activityLog.create({
      data: {
        userId,
        action: "workspace-created",
        title: `Created workspace: ${createdWorkspace.name}`,
        description:
          createdWorkspace.description ||
          `Workspace created with ${createdWorkspace.visibility} visibility.`,
      },
    });

    return createdWorkspace;
  });

  return NextResponse.json({ workspace }, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof parsedBody !== "object" || parsedBody === null || Array.isArray(parsedBody)) {
    return NextResponse.json({ error: "Workspace data must be a JSON object." }, { status: 400 });
  }

  const body = parsedBody as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id.trim() : "";

  if (!id) {
    return NextResponse.json({ error: "Workspace id is required." }, { status: 400 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!workspace) {
    return NextResponse.json({ deleted: false }, { status: 200 });
  }

  await prisma.$transaction([
    prisma.workspace.delete({ where: { id: workspace.id } }),
    prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "workspace-deleted",
        title: `Deleted workspace: ${workspace.name}`,
        description: "The workspace was removed from your Devora dashboard.",
      },
    }),
  ]);

  return NextResponse.json({ deleted: true }, { status: 200 });
}
