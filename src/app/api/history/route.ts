import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await prisma.activityLog.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return NextResponse.json({ history });
}

export async function POST(request: Request) {
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
    return NextResponse.json({ error: "Activity entry must be a JSON object." }, { status: 400 });
  }

  const body = parsedBody as Record<string, unknown>;
  const action = typeof body.action === "string" ? body.action.trim() : "used-tool";
  const title = typeof body.title === "string" ? body.title.trim() : "Tool session";
  const description =
    body.description === undefined
      ? ""
      : typeof body.description === "string"
        ? body.description.trim()
        : null;

  if (
    !/^[a-z0-9][a-z0-9-]{0,63}$/.test(action) ||
    !title ||
    title.length > 160 ||
    description === null ||
    description.length > 1000
  ) {
    return NextResponse.json({ error: "Invalid activity entry." }, { status: 400 });
  }

  const item = await prisma.activityLog.create({
    data: {
      userId: auth.user.id,
      action,
      title,
      description,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
