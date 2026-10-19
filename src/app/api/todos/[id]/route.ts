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
      { error: "Todo data must be a JSON object." },
      { status: 400 },
    );
  }

  const data: {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    dueAt?: Date | null;
    workspaceId?: string | null;
  } = {};
  if (body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 160
    ) {
      return NextResponse.json(
        { error: "Todo title must be between 1 and 160 characters." },
        { status: 400 },
      );
    }
    data.title = body.title.trim();
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      return NextResponse.json(
        { error: "Todo description must be text." },
        { status: 400 },
      );
    }
    if (
      typeof body.description === "string" &&
      body.description.trim().length > 1000
    ) {
      return NextResponse.json(
        { error: "Todo description must be 1,000 characters or fewer." },
        { status: 400 },
      );
    }
    data.description =
      typeof body.description === "string" ? body.description.trim() : null;
  }
  if (body.status !== undefined) {
    if (
      body.status !== "todo" &&
      body.status !== "in-progress" &&
      body.status !== "done"
    ) {
      return NextResponse.json(
        { error: "Invalid todo status." },
        { status: 400 },
      );
    }
    data.status = body.status;
  }
  if (body.priority !== undefined) {
    if (
      body.priority !== "low" &&
      body.priority !== "medium" &&
      body.priority !== "high"
    ) {
      return NextResponse.json(
        { error: "Invalid todo priority." },
        { status: 400 },
      );
    }
    data.priority = body.priority;
  }
  if (body.dueAt !== undefined) {
    const dueAt = parseDate(body.dueAt);
    if (dueAt === undefined) {
      return NextResponse.json({ error: "Invalid due date." }, { status: 400 });
    }
    data.dueAt = dueAt;
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
      { error: "Provide at least one todo field to update." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const existing = await prisma.todo.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Todo not found." }, { status: 404 });
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

  const todo = await prisma.todo.update({ where: { id: existing.id }, data });
  return NextResponse.json({ todo });
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
  const existing = await prisma.todo.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!existing) {
    return NextResponse.json({ deleted: false }, { status: 200 });
  }

  await prisma.todo.delete({ where: { id: existing.id } });
  return NextResponse.json({ deleted: true }, { status: 200 });
}
