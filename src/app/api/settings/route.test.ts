import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, prisma } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  prisma: {
    userSettings: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth-user", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { POST } from "@/app/api/settings/route";

const existingSettings = {
  userId: "user-1",
  theme: "dark",
  defaultView: "dashboard",
  notifications: true,
  compactMode: false,
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: "user-1" } });
    prisma.userSettings.findUnique.mockResolvedValue(existingSettings);
    prisma.$transaction.mockImplementation(async (operation) =>
      operation({
        userSettings: {
          upsert: prisma.userSettings.upsert,
        },
        activityLog: {
          create: prisma.activityLog.create,
        },
      }),
    );
  });

  it("rejects invalid preference values without writing", async () => {
    const response = await POST(makeRequest({ theme: "neon" }));

    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("updates only supplied fields and logs a real change atomically", async () => {
    prisma.userSettings.upsert.mockResolvedValue({
      ...existingSettings,
      theme: "light",
    });

    const response = await POST(makeRequest({ theme: "light" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.settings.theme).toBe("light");
    expect(prisma.userSettings.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      update: { theme: "light" },
      create: {
        userId: "user-1",
        theme: "light",
        defaultView: "dashboard",
        notifications: true,
        compactMode: false,
      },
    });
    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        action: "settings-updated",
        title: "Updated account settings",
        description: "Saved your Devora preferences.",
      },
    });
  });

  it("does not add history when the submitted settings are unchanged", async () => {
    prisma.userSettings.upsert.mockResolvedValue(existingSettings);

    const response = await POST(makeRequest({ theme: "dark" }));

    expect(response.status).toBe(200);
    expect(prisma.activityLog.create).not.toHaveBeenCalled();
  });
});
