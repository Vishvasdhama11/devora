import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import {
  isProjectStatus,
  parseProjectDate,
  parseProjectUrl,
} from "@/lib/project-fields";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json({ workspace });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.user.id;
  const { id } = await params;
  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    typeof parsedBody !== "object" ||
    parsedBody === null ||
    Array.isArray(parsedBody)
  ) {
    return NextResponse.json(
      { error: "Workspace data must be a JSON object." },
      { status: 400 },
    );
  }

  const body = parsedBody as Record<string, unknown>;
  const name =
    body.name === undefined
      ? undefined
      : typeof body.name === "string"
        ? body.name.trim()
        : null;
  const description =
    body.description === undefined
      ? undefined
      : typeof body.description === "string"
        ? body.description.trim()
        : null;
  const visibility = body.visibility;
  const status = body.status;
  const techStack =
    body.techStack === undefined
      ? undefined
      : typeof body.techStack === "string"
        ? body.techStack.trim()
        : null;
  const progress = body.progress;
  const deadline =
    body.deadline === undefined ? undefined : parseProjectDate(body.deadline);
  const repositoryUrl =
    body.repositoryUrl === undefined
      ? undefined
      : parseProjectUrl(body.repositoryUrl);
  const demoUrl =
    body.demoUrl === undefined ? undefined : parseProjectUrl(body.demoUrl);

  if (
    name === null ||
    (name !== undefined && (!name || name.length > 100)) ||
    description === null ||
    (description !== undefined && description.length > 1000) ||
    (visibility !== undefined &&
      visibility !== "private" &&
      visibility !== "team") ||
    (status !== undefined && !isProjectStatus(status)) ||
    techStack === null ||
    (techStack !== undefined && techStack.length > 200) ||
    (progress !== undefined &&
      (typeof progress !== "number" ||
        !Number.isInteger(progress) ||
        progress < 0 ||
        progress > 100)) ||
    (body.deadline !== undefined && deadline === undefined) ||
    (body.repositoryUrl !== undefined && repositoryUrl === undefined) ||
    (body.demoUrl !== undefined && demoUrl === undefined) ||
    (name === undefined &&
      description === undefined &&
      visibility === undefined &&
      status === undefined &&
      techStack === undefined &&
      progress === undefined &&
      deadline === undefined &&
      repositoryUrl === undefined &&
      demoUrl === undefined)
  ) {
    return NextResponse.json(
      { error: "Invalid workspace data." },
      { status: 400 },
    );
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id, userId },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (transaction) => {
    const updatedWorkspace = await transaction.workspace.update({
      where: { id: workspace.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(visibility !== undefined && { visibility }),
        ...(status !== undefined && { status }),
        ...(techStack !== undefined && { techStack }),
        ...(progress !== undefined && { progress }),
        ...(deadline !== undefined && { deadline }),
        ...(repositoryUrl !== undefined && { repositoryUrl }),
        ...(demoUrl !== undefined && { demoUrl }),
      },
    });

    await transaction.activityLog.create({
      data: {
        userId,
        action: "workspace-updated",
        title: `Updated workspace: ${updatedWorkspace.name}`,
        description: "Saved workspace changes.",
      },
    });

    return updatedWorkspace;
  });

  return NextResponse.json({ workspace: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.user.id;
  const { id } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id, userId },
  });

  if (!workspace) {
    return NextResponse.json({ deleted: false }, { status: 200 });
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.workspace.delete({ where: { id: workspace.id } });
    await transaction.activityLog.create({
      data: {
        userId,
        action: "workspace-deleted",
        title: `Deleted workspace: ${workspace.name}`,
        description: "The workspace was removed from your Devora dashboard.",
      },
    });
  });

  return NextResponse.json({ deleted: true }, { status: 200 });
}
