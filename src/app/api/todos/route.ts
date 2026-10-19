import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

function objectBody(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseDate(value: unknown): Date | null | undefined {
  if (value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    date.toISOString().slice(0, 10) !== value
  ) {
    return undefined;
  }
  return date;
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todos = await prisma.todo.findMany({
    where: { userId: auth.user.id },
    include: { workspace: { select: { id: true, name: true } } },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return NextResponse.json({ todos });
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
      { error: "Todo data must be a JSON object." },
      { status: 400 },
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    body.description === undefined
      ? ""
      : typeof body.description === "string"
        ? body.description.trim()
        : null;
  const status = body.status ?? "todo";
  const priority = body.priority ?? "medium";
  const dueAt = body.dueAt === undefined ? null : parseDate(body.dueAt);
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
    title.length > 160 ||
    description === null ||
    description.length > 1000 ||
    (status !== "todo" && status !== "in-progress" && status !== "done") ||
    (priority !== "low" && priority !== "medium" && priority !== "high") ||
    dueAt === undefined ||
    workspaceId === undefined
  ) {
    return NextResponse.json({ error: "Invalid todo data." }, { status: 400 });
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

  const todo = await prisma.todo.create({
    data: {
      userId: auth.user.id,
      workspaceId,
      title,
      description,
      status,
      priority,
      dueAt,
    },
  });

  return NextResponse.json({ todo }, { status: 201 });
}
