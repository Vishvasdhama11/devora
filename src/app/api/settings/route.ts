import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: auth.user.id },
  });

  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.user.id;
  const body = (await request.json()) as {
    theme?: unknown;
    defaultView?: unknown;
    notifications?: unknown;
    compactMode?: unknown;
  };
  const allowedThemes = ["dark", "light", "system"];
  const allowedViews = ["dashboard", "tools", "favorites"];
  const isAllowedValue = (value: unknown, allowed: readonly string[]): value is string =>
    typeof value === "string" && allowed.includes(value);

  if (
    (body.theme !== undefined && !isAllowedValue(body.theme, allowedThemes)) ||
    (body.defaultView !== undefined && !isAllowedValue(body.defaultView, allowedViews)) ||
    (body.notifications !== undefined && typeof body.notifications !== "boolean") ||
    (body.compactMode !== undefined && typeof body.compactMode !== "boolean")
  ) {
    return NextResponse.json({ error: "Invalid settings values." }, { status: 400 });
  }

  const existingSettings = await prisma.userSettings.findUnique({
    where: { userId },
  });
  const data = {
    theme: body.theme,
    defaultView: body.defaultView,
    notifications: body.notifications,
    compactMode: body.compactMode,
  };

  const settings = await prisma.$transaction(async (transaction) => {
    const updatedSettings = await transaction.userSettings.upsert({
      where: { userId },
      update: {
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.defaultView !== undefined && { defaultView: data.defaultView }),
        ...(data.notifications !== undefined && { notifications: data.notifications }),
        ...(data.compactMode !== undefined && { compactMode: data.compactMode }),
      },
      create: {
        userId,
        theme: data.theme ?? "dark",
        defaultView: data.defaultView ?? "dashboard",
        notifications: data.notifications ?? true,
        compactMode: data.compactMode ?? false,
      },
    });

    if (
      !existingSettings ||
      existingSettings.theme !== updatedSettings.theme ||
      existingSettings.defaultView !== updatedSettings.defaultView ||
      existingSettings.notifications !== updatedSettings.notifications ||
      existingSettings.compactMode !== updatedSettings.compactMode
    ) {
      await transaction.activityLog.create({
        data: {
          userId,
          action: "settings-updated",
          title: "Updated account settings",
          description: "Saved your Devora preferences.",
        },
      });
    }

    return updatedSettings;
  });

  return NextResponse.json({ settings });
}
